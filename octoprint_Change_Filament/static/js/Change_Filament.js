/*
 * OctoPrint Change_Filament plugin.
 *
 * Copyright (c) 2019, Jim Pingle <jim@pingle.org>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
$(function() {
    const preParkPauseGCODEs = [
        'M0',
    ];
    const preParkHomeGCODEs = [
        'G28 X0 Y0',
    ];
    const preParkExtrudeGCODEs = [
        'M83',
        'G1 E-5 F50',
    ];

	function Change_filamentViewModel(parameters) {
		const self = this;

		self.settings = parameters[0];
		self.controlViewModel = parameters[1];

		self.getAdditionalControls = function() {
			const settings = self.settings.settings.plugins.Change_Filament;

            const setPreParkPauseGCODEs = (
                (settings.pause_before_park() != false)
                ? preParkPauseGCODEs
                : []
            );
            const setPreParkHomeGCODEs = (
                (settings.home_before_park() != false)
                ? 'G28 X0 Y0'
                : ''
            );
            const setPreParkExtrudeGCODEs = (
                (settings.retract_before_park() != false)
                ? preParkExtrudeGCODEs
                : []
            );

            const zLiftRelative = settings.z_lift_relative();
            const parkSpeed = settings.park_speed();
            const parkCoodinates = {
                x: settings.x_park(),
                y: settings.y_park(),
            };
            const loadConfig = {
                speed: settings.load_speed(),
                length: settings.load_length(),
            };
            const unloadConfig = {
                speed: settings.unload_speed(),
                length: settings.unload_length(),
            };

			return [{
				'customClass': '',
                'layout': 'horizontal',
                'name': 'Change Filament',
                'children': [
					{
                        'commands': [
                            'M117 Parking nozzle',
                            ...setPreParkPauseGCODEs,
                            ...setPreParkExtrudeGCODEs,
                            'G91',
                            'G0 Z' + zLiftRelative + ' F' + parkSpeed,
                            ...setPreParkHomeGCODEs,
                            'G90',
                            'G0 Y' + parkCoodinates.y + ' X' + parkCoodinates.x + ' F' + parkSpeed,
                            'M117 Nozzle parked',
						],
						'customClass': 'btn',
                        'additionalClasses': 'changefilament-park',
                        'name': 'Park',
                    },
					{
                        'commands': [
                            'M117 Unloading filament',
                            'M83',
                            'G1 E-' + unloadConfig.length + ' F' + unloadConfig.speed,
                            'M18 E',
                            'M117 Replace filament, set new temp, click Load',
						],
						'customClass': 'btn',
                        'additionalClasses': 'changefilament-unload',
                        'name': 'Unload',
                    },
					{
                        'commands': [
                            'M117 Loading filament',
                            'M83',
                            'G1 E' + loadConfig.length + ' F' + loadConfig.speed,
                            'M117 New Filament Loaded',
						],
						'customClass': 'btn',
                        'additionalClasses': 'changefilament-load',
                        'name': 'Load',
                    },
					{
                        'commands': [
                            'M600'
						],
						'customClass': 'btn',
                        'additionalClasses': 'btn-danger changefilament-m600',
                        'name': 'M600',
                    },
					{
                        'output': 'WARNING: Preheat first! Refresh page after changing settings.',
                    },
					{
                        'output': 'M600 requires special support in Marlin and must be completed using the control box.',
                    },
				]
			}];
		};
	}

	OCTOPRINT_VIEWMODELS.push({
		construct: Change_filamentViewModel,
		dependencies: [ "settingsViewModel", "controlViewModel" ]
	});
});

/**
 * Copyright 2019, Jim Pingle <jim@pingle.org> and the OctoPrint Change_Filament plugin contributors
 * SPDX-License-Identifier: BSD-3-Clause
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

        const [ settingsViewModel, controlViewModel ] = parameters;

        self.getAdditionalControls = function() {
            const pluginSettings = settingsViewModel.settings.plugins.Change_Filament;

            const setPreParkPauseGCODEs = (
                (pluginSettings.pause_before_park() != false)
                ? preParkPauseGCODEs
                : []
            );
            const setPreParkHomeGCODEs = (
                (pluginSettings.home_before_park() != false)
                ? 'G28 X0 Y0'
                : ''
            );
            const setPreParkExtrudeGCODEs = (
                (pluginSettings.retract_before_park() != false)
                ? preParkExtrudeGCODEs
                : []
            );

            const zLiftRelative = pluginSettings.z_lift_relative();
            const parkSpeed = pluginSettings.park_speed();
            const parkCoordinates = {
                x: pluginSettings.x_park(),
                y: pluginSettings.y_park(),
            };
            const loadConfig = {
                speed: pluginSettings.load_speed(),
                length: pluginSettings.load_length(),
            };
            const unloadConfig = {
                speed: pluginSettings.unload_speed(),
                length: pluginSettings.unload_length(),
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
                            'G0 Y' + parkCoordinates.y + ' X' + parkCoordinates.x + ' F' + parkSpeed,
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

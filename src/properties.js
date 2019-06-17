import auth from "@/auth";


export const properties = () => {
    // *****************************************************************************
    // Settings section
    // *****************************************************************************
    var appearanceSection = {
        uses: "settings",
        items: {
            defaultmode: {
                type: "boolean",
                label: "Switch Settings",
                ref: "DefaultMode",
                component: "switch",
                options: [{
                    value: true,
                    label: "Voice Control Switch Enabled"
                }, {
                    value: false,
                    label: "Voice Control Always On"
                }],
                defaultValue: true
            },
            notificationmode: {
                type: "boolean",
                label: "Notifications",
                ref: "NotificationMode",
                component: "switch",
                options: [{
                    value: true,
                    label: "Enabled"
                }, {
                    value: false,
                    label: "Disabled"
                }],
                defaultValue: true
            },
            contextmode: {
                type: "string",
                label: "Selection Context",
                component: "radiobuttons",
                ref: "ContextMode",
                options: [{
                    value: "CurrentSelections",
                    label: "Current Selections"
                }, {
                    value: "Cleared",
                    label: "Cleared"
                }, {
                    value: "LockedFieldsOnly",
                    label: "Locked Fields Only"
                }],
                defaultValue: "CurrentSelections"
            },
            debugmode: {
                type: "boolean",
                label: "Debug Mode",
                ref: "DebugMode",
                defaultValue: true
            }
        }
    };

    // *****************************************************************************
    // Main properties panel definition
    // Only what is defined here is returned from properties.js
    // *****************************************************************************
    return {
        type: "items",
        component: "accordion",
        items: {
            Settings: appearanceSection,
            about: auth.getPanal()
        }
    };
};
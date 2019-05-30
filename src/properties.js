const $ = require("jquery");
import axios from "axios";
import { isValidToken } from "@/auth";

import {
    setRefValue
} from "@/utils";


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
            about: {
                label: "About",
                ref: "auth",
                items: {
                    header: {
                        type: "string",
                        label: "Header Holder",
                        ref: "NAHEADER",
                        component: {
                            template: `
                            <div class="pp-component">
                                <img src="https://s3-eu-west-1.amazonaws.com/calltoaction-public-assets/w0w-toolkit-logo.svg"
                                style="width: 70%;"/>
                                <img src="https://s3-eu-west-1.amazonaws.com/calltoaction-public-assets/icon-writeback-table.svg"
                                    style="width: 25%;"/>
                                <div class="auth_form_group">
                                    <h3 class="panel__title">About</h3>
                                    <label>The Writeback Table extension lets you input data
                                    into Qlik. It works by storing the data into an external
                                    database and then you can pull the write back dat
                                    a in via the REST Connector.</label>
                                </div>
                            </div>
                            `}
                    },
                    doclink: {
                        type: "button",
                        label: "Documentation",
                        ref: "NADOCLINK"
                    },
                    environment: {
                        type: "string",
                        label: "Environment",
                        ref: "environment",
                        defaultValue: "https://app.webofwork.com"
                    },
                    useremail: {
                        type: "string",
                        label: "User Email",
                        ref: "userEmail",
                        show: false
                    },
                    userid: {
                        type: "string",
                        label: "User Id",
                        ref: "userId",
                        show: false
                    },
                    accesstoken: {
                        type: "string",
                        label: "Writeback Service",
                        ref: "accessToken",
                        component: {
                            template: `
                            <div id="authPanel" class="auth_panel">
                                <div id="authPanelContainer">
                                    <div id="authForm" ng-if="!isLoggedIn">
                                        <label class="pp-component">Login to w0w to Activate Extension.</label>
        
                                        <div class="pp-component pp-string-component">
                                            <div class="label" title="Email">Email</div>
                                            <input class="lui-input" id="authEmail" type="email" />
                                        </div>
                                       
                                        <div class="pp-component pp-string-component">
                                            <div class="label" title="Password">Password</div>
                                            <input class="lui-input" id="authPassword" type="password" />
                                        </div>
                                        
                                        <label class="lui-text-danger" ng-if="errormessage" style="padding: 5px">
                                            {{errormessage}}
                                        </label>

                                        <div class="pp-component pp-button-component">
                                            <button ng-click="login()" class="lui-button lui-button--block"
                                                id="authSubmit">Login</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
    
                            <div id="responsePanel" class="pp-component" ng-if="isLoggedIn">
                                <h3 class="auth_panel__title ">Logged in as: </h3>
                                <p>{{data.userEmail}}</p>
                                <h3>Autorization</h3>
                                <div class="auth_form__input">
                                    <textarea style="width: 100%;" disabled rows="3">{{data.accessToken}}</textarea>
                                </div>
                                <br>
                                <button ng-click="logout()" id="logoutBtn" class="lui-button  lui-button--block">Logout</button>
                            </div>
                            `,
                            controller: ["$scope", "$element", function ($scope, $element) {
                                console.log("TCL: properties -> $element", $element);
                                console.log("TCL: $scope -> c", $scope);

                                let data = $scope.$parent.data;

                                console.log("extension data", data);


                                if (data.accessToken != "") {

                                    isValidToken(data.environment, data.accessToken, data.userId).then(function (r) {
                                        $scope.isLoggedIn = true;
                                        console.log("Logged in.");
                                    }).catch((err) => {
                                        console.log(err);
                                        $scope.isLoggedIn = false;
                                        console.log("Token exists but not valid.");

                                    });

                                } else {

                                    $scope.isLoggedIn = false;


                                }

                                //$scope.URL = 'https://' + data.rootURI + '/api/writebacks/' + (data.writebackId || '{Id}');


                                $scope.login = function (data) {

                                    let email = $("#authEmail").val();
                                    let password = $("#authPassword").val();
                                    if (!email.trim() || !password.trim()) {
                                        return alert("Invalid login form");
                                    }

                                    let authURL = `${$scope.data.environment}/api/users/login`;

                                    axios.post(authURL, {
                                        email,
                                        password
                                    }).then(function (res) {
                                        console.log("response from server", res);

                                        isValidToken($scope.data.environment, res.data.id, res.data.userId).then(function (r) {

                                            // Updating the layout and save
                                            console.log("Response from token check", res);

                                            setRefValue($scope.data, "accessToken", res.data.id);
                                            setRefValue($scope.data, "userId", res.data.userId);
                                            setRefValue($scope.data, "userEmail", $("#authEmail").val());


                                            $scope.isLoggedIn = true;
                                            $scope.errormessage = null;

                                            //  "function" == typeof c.definition.change && c.definition.change(c.data, c.args.handler);
                                            $scope.$emit("saveProperties");

                                            //app.doSave();
                                            console.log("Token Saved.");
                                        });

                                    })
                                        .catch((err) => {
                                            console.log(err);
                                            setRefValue($scope.data, "accessToken", "");

                                            $scope.isLoggedIn = false;
                                            console.log("Token Invalid.");
                                            $scope.errormessage = "Token is invalid. Please login.";

                                            //  "function" == typeof c.definition.change && c.definition.change(c.data, c.args.handler);
                                            $scope.$emit("saveProperties");


                                        });
                                };

                                $scope.logout = function () {
                                    setRefValue($scope.data, "accessToken", "");
                                    setRefValue($scope.data, "userId", "");
                                    setRefValue($scope.data, "userEmail", "");
                                    $scope.isLoggedIn = false;

                                    //Timeout token server side. DO THIS


                                    //  "function" == typeof c.definition.change && c.definition.change(c.data, c.args.handler);
                                    $scope.$emit("saveProperties");
                                    console.log("Token Cleared.");


                                };
                            }]
                        }
                    }
                }
            }
        }
    };
};
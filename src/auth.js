/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
const settings = require("../package.json").authpanel;
const $ = require("jquery");
const qlik = require("qlik");
import { setRefValue } from "@/utils";
import axios from "axios";
import _ from "lodash";

export default {
    global: qlik.getGlobal(),
    instance: null,
    app: null,
    appLayout: null,
    rootElment: null,
    origin: null,
    appId: null,
    user: null,
    /**
     * 
     * @param {*} $element root DOM element which contains the extension content
     * @param {*} $scope AngularJS scope object
     * @description init for setting up the extension components and validating the login state
     */
    init: async function ($element, $scope) {
        this.instance = $scope.$parent;
        this.app = qlik.currApp(this.instance);
        this.appLayout = this.instance.$parent.layout;
        this.rootElment = $element;
        this.origin = location.origin;

        if (this.appLayout) {
            const extName = this.appLayout.extensionMeta.template;
            $("head").append(`<link rel="stylesheet" href="${origin}/extensions/${extName}/style.css"/>`);

            const oldToken = _.cloneDeep(this.appLayout.AccessToken);
            const { environment, userId } = this.appLayout;
            let externalToken = null;
            if (userId) {
                try {
                    const { data } = await axios.get(`${origin}/extensions/${extName}/token.json`);
                    if (data && data.accessToken) {
                        await this.isValidToken(environment, data.accessToken, userId);
                        await this.updateState([
                            { key: "AccessToken", value: data.accessToken },
                            { key: "accessToken", value: data.accessToken }
                        ]);
                        externalToken = data.accessToken;
                    }
                } catch (ex) {
                    this.updateState([
                        { key: "AccessToken", value: null },
                        { key: "accessToken", value: null }
                    ]);
                }
            }

            const AccessToken = this.appLayout.AccessToken || externalToken || oldToken;
            if (!AccessToken) return;
            if (userId) {
                this.isValidToken(environment, AccessToken, userId)
                    .then(({ data }) => {
                        this.user = data;
                        this.updateState([
                            { key: "AccessToken", value: AccessToken },
                            { key: "accessToken", value: AccessToken }
                        ]);
                    })
                    .catch(() => {
                        this.updateState([
                            { key: "AccessToken", value: null },
                            { key: "accessToken", value: null }
                        ]);
                    });
            } else {
                this.logout();
            }
        }

        this.postUsage(this.appLayout.environment);
    },
    /**
     * 
     * @param {*} environment request root URL
     * @param {*} token authentication token
     * @param {*} userId logged in user Id
     * @description isValidToken validates current token by making a request to
     * /users/{id} end-point and if the status code is not 200 then it's not valid
     */
    isValidToken: function (environment, token, userId) {
        const tokenQuery = "?access_token=" + token;
        return axios.get(`${environment}/api/users/${userId + tokenQuery}`);
    },
    /**
     * @description logout destroys the user session by removing token keys from the layout
     */
    logout: function () {
        this.updateState([
            { key: "AccessToken", value: null },
            { key: "accessToken", value: null }
        ]);
    },
    /**
     * 
     * @param {*} environment request root URL
     * @description postUsage creates a new extension usage record
     */
    postUsage: async function (environment) {
        const currentApp = qlik.currApp();
        if (!currentApp) return;
        const _locations = currentApp.id.split("\\");
        const { qReturn: isPersonal } = await this.global.isPersonalMode();

        const qlikAppId = _locations[(_locations.length - 1)];
        this.appId = qlikAppId;
        const qlikServerURL = this.origin;
        const environmentType = isPersonal === true ? "DeskTop" : "Cloud";
        const { qReturn: qlikUserId } = await this.global.getAuthenticatedUser();
        const action = "mounted";
        const userId = this.appLayout.userId;

        if (userId) {
            return axios.post(`${environment}/api/extensionUsages`, {
                qlikAppId,
                qlikServerURL,
                environmentType,
                qlikUserId,
                action,
                userId
            });
        }

    },
    /**
     * 
     * @param {*} props array of layout properties to be updated
     * @description updateState updates current state by updating the layout properties using `backendApi`
     */
    updateState: function (props) {
        return this.instance.backendApi.getProperties().then((state) => {
            props.forEach((prop) => state[prop.key] = prop.value);
            this.instance.backendApi.setProperties(state);
            // checks for is desktop version
            this.global.isPersonalMode(reply => {
                const isPersonalMode = reply.qReturn;
                if (isPersonalMode) {
                    console.log("Personal Mode!");
                    this.app.doSave();
                }
            });
        });
    },
    /**
     * @description getPanal generates the Authentication panel for allowing users to login to the extension
     */
    getPanal: function () {
        const instance = this;
        return {
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
                            <img src="${settings.logo}"
                            style="width: 70%;"/>
                            <img src="${settings.icon}"
                                style="width: 25%;"/>
                            <div class="auth_form_group">
                                <h3 class="panel__title">About</h3>
                                <label>${settings.about}</label>
                            </div>
                        </div>
                        `}
                },
                doclink: {
                    component: "button",
                    label: "Documentation",
                    ref: "NADOCLINK",
                    action: () => window.open(settings.docs, "_blank")
                },
                environment: {
                    type: "string",
                    label: "Environment",
                    ref: "environment",
                    defaultValue: settings.env
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
                    label: `${settings.type} Service`,
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
                        <div id="responsePanel" ng-if="isLoggedIn">
                            <div class="pp-component">
                                <h4>Logged in as:</h4>
                                <p>{{data.userEmail}}</p>
                            </div>
                            <div class="pp-component">
                                <h4>Autorization</h4>
                                <textarea style="width: 100%;" disabled rows="3">{{data.accessToken}}</textarea>
                            </div>
                            <div class="pp-component">
                                <button ng-click="logout()" id="logoutBtn" class="lui-button lui-button--block">Logout</button>
                            </div>
                        </div>
                        `,
                        controller: ["$scope", "$element", function ($scope, $element) {
                            const envInput = $("div[tid='environment']").find("input")[0];

                            if (settings.type === "writeback") {
                                const envWritebackId = $("div[tid='writebackId']").find("input")[0];
                                envWritebackId.disabled = true;
                            }

                            let data = $scope.$parent.data;
                            if (data.accessToken || data.AccessToken) {
                                $scope.isLoggedIn = true;
                                envInput.disabled = true;
                            } else {
                                $scope.isLoggedIn = false;
                                envInput.disabled = false;
                            }

                            $scope.$on("layoutchanged", function (event, data) {
                                if (data.accessToken || data.AccessToken) {
                                    $scope.isLoggedIn = true;
                                    envInput.disabled = true;
                                } else {
                                    $scope.isLoggedIn = false;
                                    envInput.disabled = false;
                                }
                            });

                            if (data.accessToken != "") {
                                instance.isValidToken(data.environment, data.accessToken, data.userId)
                                    .then(() => $scope.isLoggedIn = true)
                                    .catch(() => $scope.isLoggedIn = false);
                            } else {
                                $scope.isLoggedIn = false;
                            }

                            $scope.login = () => {
                                const email = $("#authEmail").val();
                                const password = $("#authPassword").val();
                                if (!email.trim() || !password.trim()) {
                                    return alert("Invalid login form");
                                }

                                const authURL = `${$scope.data.environment}/api/users/login`;
                                axios.post(authURL, { email, password })
                                    .then(res => {
                                        instance.isValidToken($scope.data.environment, res.data.id, res.data.userId)
                                            .then(({ data }) => {
                                                this.user = data;
                                                // Updating the layout and save
                                                setRefValue($scope.data, "accessToken", res.data.id);
                                                setRefValue($scope.data, "AccessToken", res.data.id);
                                                setRefValue($scope.data, "userId", res.data.userId);
                                                setRefValue($scope.data, "userEmail", $("#authEmail").val());

                                                $scope.isLoggedIn = true;
                                                $scope.errormessage = null;
                                                $scope.$emit("saveProperties");
                                                if (instance.app) instance.app.doSave();
                                            });
                                    })
                                    .catch(() => {
                                        setRefValue($scope.data, "accessToken", null);
                                        $scope.isLoggedIn = false;
                                        $scope.errormessage = "Token is invalid. Please login.";
                                        $scope.$emit("saveProperties");
                                        if (instance.app) instance.app.doSave();
                                    });
                            };

                            $scope.logout = () => {
                                setRefValue($scope.data, "accessToken", null);
                                setRefValue($scope.data, "userEmail", null);
                                $scope.isLoggedIn = false;
                                $scope.$emit("saveProperties");
                                instance.logout();
                            };
                        }]
                    }
                }
            }
        };
    }
};
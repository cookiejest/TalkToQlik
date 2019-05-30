/* eslint-disable quotes */
const $ = require("jquery");
const qlik = require("qlik");
import axios from "axios";
import _ from "lodash";

export default {
    global: qlik.getGlobal(),
    instance: null,
    app: null,
    appLayout: null,
    rootElment: null,
    origin: null,

    init: async function ($element, $scope) {
        this.instance = $scope.$parent;
        this.app = qlik.currApp(this.instance);
        this.appLayout = this.instance.$parent.layout;
        this.rootElment = $element;
        this.origin = location.origin;

        $element.html(`<div class="loader">Loading...</div>`);

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
            if (!AccessToken) return $element.html("<div><h1>Please Login!</h1></div>");
            if (userId) {
                this.isValidToken(environment, AccessToken, userId)
                    .then(() => {
                        this.updateState([
                            { key: "AccessToken", value: AccessToken },
                            { key: "accessToken", value: AccessToken }
                        ]);
                    })
                    .catch(() => {
                        $element.html("<div><h1>Please Login!</h1></div>");
                        this.updateState([
                            { key: "AccessToken", value: null },
                            { key: "accessToken", value: null }
                        ]);
                    })
                    .finally(() => {
                        this.instance.ext.paint($element, this.appLayout);
                    });
            } else {
                this.logout();
            }
        }

        // console.log("global   #######", this.global);
        // console.log("instance #######", this.instance);
        // console.log("app      #######", this.app);
        this.postUsage(this.appLayout.environment);
    },

    isValidToken: function (environment, token, userId) {
        const tokenQuery = "?access_token=" + token;
        return axios.get(`${environment}/api/users/${userId + tokenQuery}`);
    },

    logout: function () {
        this.updateState([
            { key: "AccessToken", value: null },
            { key: "accessToken", value: null }
        ]);

        this.rootElment.html("<div><h1>Please Login!</h1></div>");
    },

    postUsage: async function (environment) {
        const currentApp = qlik.currApp();
        if (!currentApp) return;
        const _locations = currentApp.id.split("\\");
        const { qReturn: isPersonal } = await this.global.isPersonalMode();

        const qlikAppId = _locations[(_locations.length - 1)];
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
    }
};
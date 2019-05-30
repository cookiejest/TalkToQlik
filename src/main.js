// import "@/style/vis.min.css";
import "@/style/talktoqlikstyle.css";

const qlik = require("qlik");
const $ = require("jquery");
const Routing = require("client.utils/routing");

import { properties } from "@/properties";
import auth from "@/auth";
import { utils } from "@/utils";
import annyang from "annyang";

export default (() => {
    window.isValid = false;
    var app = qlik.currApp(this);
    //Capitalize field names
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    //Get list of sheets in app
    var sheetinfo = qlik.navigation.sheets;
    var arrayLength = sheetinfo.length;
    var cleansheetinfo = [];
    for (var i = 0; i < arrayLength; i++) {
        cleansheetinfo.push({ "sheetname": sheetinfo[i].qData.title, "sheetID": sheetinfo[i].qInfo.qId });
    }

    function TalkToQlikNotification(notificationstring, notificationtype, notificationmode) {
        if (notificationmode == true) {
            var TalkToQlikMessage = null;
            if (notificationtype == "OK") {
                TalkToQlikMessage = notificationstring;
                $("#TalkToQlikNotificationDiv").html(TalkToQlikMessage);
                $("#TalkToQlikNotificationDiv").fadeIn(1);
                $("#TalkToQlikNotificationDiv").fadeOut(2000);
            } else {
                TalkToQlikMessage = notificationstring;
                $("#TalkToQlikNotificationDiv").html(TalkToQlikMessage);
                $("#TalkToQlikNotificationDiv").fadeIn(1);
            }
        }
    }

    return {
        initialProperties: {
            version: 1.02,
            qHyperCubeDef: {
                qContextMode: "CurrentSelections",
                qDebugMode: true
            }
        },
        definition: properties(),
        paint: function ($element, layout) {
            console.log("TCL: layout", layout);
            $element.html("<div><h1>Please Login!</h1></div>");
            if (!layout.AccessToken) return;

            var HTMLcontent = "";
            if (layout.DefaultMode === true) {
                HTMLcontent = `
                <div class="onoffswitch">
                    <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked>
                    <label class="onoffswitch-label" for="myonoffswitch">
                        <span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span>
                    </label>
                </div>
                <div id="TalkToQlikNotificationDiv"></div>`;
            } else {
                annyang.resume();
                HTMLcontent = `<div id="TalkToQlikNotificationDiv"></div>`;
            }
            $element.html(HTMLcontent);
            var contextmode = null;
            if (layout.ContextMode == undefined) {
                contextmode = "CurrentSelections";
            } else {
                contextmode = layout.ContextMode;
            }

            if (annyang) {
                annyang.addCallback("result", function () {
                    console.log("Listening");
                    TalkToQlikNotification("Listening...", "temp", layout.NotificationMode);
                });

                // Let's define a command.
                var commands = {
                    "say hello": function () {
                        TalkToQlikNotification("Said Hello", "OK", layout.NotificationMode);
                        alert("Hello world!");
                        console.log("Hello world!");
                    },
                    "clear selection": function () {
                        TalkToQlikNotification("Clear All", "OK", layout.NotificationMode);
                        app.clearAll();
                    },
                    "go forward": function () {
                        app.forward();
                        TalkToQlikNotification("Go Forward", "OK", layout.NotificationMode);
                    },
                    "go back": function () {
                        app.back();
                        TalkToQlikNotification("Go Back", "OK", layout.NotificationMode);
                    },
                    "lock": function () {
                        app.lockAll();
                        TalkToQlikNotification("Lock App", "OK", layout.NotificationMode);
                    },
                    "unlock": function () {
                        TalkToQlikNotification("Unlock App", "OK", layout.NotificationMode);
                        app.unlockAll();
                    },
                    "reload app": function () {
                        TalkToQlikNotification("Reload App", "OK", layout.NotificationMode);
                        app.doReload();
                    },
                    "search for *term": function (term) {
                        console.log("Search Term: " + term);
                        var notification = "Searching for " + term;
                        TalkToQlikNotification(notification, "NoFade");
                        var searchvalues = [term];
                        console.log(searchvalues);
                        app.model.waitForOpen.promise.then(function () {
                            app.global.session.rpc({ "method": "SelectAssociations", "handle": 1, "params": [{ "qContext": contextmode }, searchvalues, 0] }).then(function (data) {
                                console.log(data);
                                var notification = "Searched for " + term;
                                TalkToQlikNotification(notification, "OK", layout.NotificationMode);
                            });
                        });
                    },
                    "clear *fieldname": function (fieldname) {
                        app.field(toTitleCase(fieldname)).clear();
                        console.log("Clear " + fieldname);
                        var notification = "Cleared " + fieldname;
                        TalkToQlikNotification(notification, "OK", layout.NotificationMode);
                    },
                    "lock *fieldname": function (fieldname) {
                        app.field(toTitleCase(fieldname)).lock();
                        console.log("Lock " + fieldname);
                        var notification = "Locked " + fieldname;
                    },
                    "unlock *fieldname": function (fieldname) {
                        app.field(toTitleCase(fieldname)).unlock();
                        console.log("Unlock " + fieldname);
                        var notification = "Unlocked " + fieldname;
                    },
                    "select alternative *fieldname": function (fieldname) {
                        app.field(toTitleCase(fieldname)).selectAlternative();
                        console.log("Select Alternative " + fieldname);
                        var notification = "Selected Alternative " + fieldname;
                    },
                    "select excluded *fieldname": function (fieldname) {
                        app.field(toTitleCase(fieldname)).selectExcluded();
                        console.log("Select Excluded " + fieldname);
                        var notification = "Selected Excluded " + fieldname;
                    },
                    "show me *sheetname": function (sheetname) {
                        var cleansheetname = toTitleCase(sheetname);
                        console.log("Navigate to sheet " + cleansheetname);
                        var results = cleansheetinfo.filter(function (entry) { return entry.sheetname === cleansheetname; });
                        var notification = "Navigate to sheet " + cleansheetname;
                        //if no sheet found set notification
                        Routing.goToSheet(results[0].sheetID);
                    }
                };

                $("#myonoffswitch").change(function () {
                    if ($("#myonoffswitch").is(":checked") == true) {
                        annyang.resume();
                        console.log("resume voice control");
                        TalkToQlikNotification("Voice control enabled", "OK", layout.NotificationMode);
                    } else {
                        annyang.pause();
                        console.log("pause voice control");
                        TalkToQlikNotification("Voice control disabled", "OK", layout.NotificationMode);
                    }
                });

                // Add our commands to annyang
                annyang.addCommands(commands);
                // Start listening.
                annyang.start();
                TalkToQlikNotification("Voice control enabled", "OK", layout.NotificationMode);
            } else {
                TalkToQlikNotification("Voice control not supported, use Chrome", "Error", layout.NotificationMode);
                HTMLcontent = "Voice control not supported, use Chrome";
                $element.html(HTMLcontent);
                console.log("Voice control not supported, use Chrome");
            }

            console.log("painted!");
        },
        controller: function ($element, $scope) {
            auth.init($element, $scope);
        }
    };
})();

const qlik = require("qlik");
const $ = require("jquery");

import { properties } from "@/properties";
import { paint } from "@/paint";
import { isValidToken } from "@/auth";
import { store } from "@/store";
import { utils } from "@/utils";

export default (() => {

	store.global = qlik.getGlobal();
	store.app = qlik.currApp(this);
	store.isFormMounted = false;
	store.appLayout = null;
	window.isValid = false;

	// $('<link rel="stylesheet" type="text/css" href="/extensions/TalktoQlik/styles.css">').appendTo("head");



	//console.log(qlik);

	var app = qlik.currApp(this);

	//Capitalize field names
	function toTitleCase(str) {
		return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
	}


	////////////////////////////////////////////
	//Get list of sheets in app
	var sheetinfo = qlik.navigation.sheets;

	var arrayLength = sheetinfo.length;

	var cleansheetinfo = [];
	for (var i = 0; i < arrayLength; i++) {


		cleansheetinfo.push({ 'sheetname': sheetinfo[i].qData.title, 'sheetID': sheetinfo[i].qInfo.qId });
		//Do something
	}
	////////////////////////////////////////////


	function TalkToQlikNotification(notificationstring, notificationtype, notificationmode) {

		if (notificationmode == true) {

			if (notificationtype == 'OK') {

				var TalkToQlikMessage = notificationstring;

				$('#TalkToQlikNotificationDiv').html(TalkToQlikMessage);

				$('#TalkToQlikNotificationDiv').fadeIn(1);

				$('#TalkToQlikNotificationDiv').fadeOut(2000);

			} else {

				var TalkToQlikMessage = notificationstring;

				$('#TalkToQlikNotificationDiv').html(TalkToQlikMessage);

				$('#TalkToQlikNotificationDiv').fadeIn(1);

			}
		}
	}




	return {
		// new object properties
		initialProperties: {
			version: 1.02,
			qHyperCubeDef: {
				// Custom properties
				qContextMode: "CurrentSelections",
				qDebugMode: true
			}
		},

		definition: properties(utils),
		paint: function ($element, layout) {

			return paint(this, $element, layout);

		},
		mounted: async function ($element) {
			var _this = this;
			$element.html("<div class=\"loader\">Loading...</div>");

			setTimeout(() => {
				if (store.appLayout) {
					const extName = store.appLayout.extensionMeta.name;

					// Will be updated later
					$("head").append(`<link rel="stylesheet" href="//localhost:4848/extensions/${extName}/style.css" type="text/css" />`);

					const { rootURI, AccessToken, userId } = store.appLayout;
					if (!AccessToken) return $element.html("<div><h1>Please Login!</h1></div>");
					isValidToken(rootURI, AccessToken, userId)
						.then(res => {
							if (res.status === 200) window.isValid = true;
						})
						.catch(() => $element.html("<div><h1>Please Login!</h1></div>"))
						.finally(() => _this.paint($element, store.appLayout));
				}
			}, 1000);
			console.log("Mounted!");
		}//end return

	}//close function
}); //close define


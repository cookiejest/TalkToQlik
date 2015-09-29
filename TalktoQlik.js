define(["./properties", "qlik","jquery","client.utils/routing", "./annyang.min"], 
	function(Props, qlik,$,Routing) {
		'use strict';


	 	$('<link rel="stylesheet" type="text/css" href="/extensions/TalktoQlik/talktoqlikstyle.css">').appendTo("head");



		//console.log(qlik);

		var app = qlik.currApp(this);


		//Function to enable console logging in debug mode.
		var logger = function()
		{
		    var oldConsoleLog = null;
		    var pub = {};

		    pub.enableLogger =  function enableLogger() 
		                        {
		                            if(oldConsoleLog == null)
		                                return;

		                            window['console']['log'] = oldConsoleLog;
		                        };

		    pub.disableLogger = function disableLogger()
		                        {
		                            oldConsoleLog = console.log;
		                            window['console']['log'] = function() {};
		                        };

		    return pub;
		}();



		//Capitalize field names
		function toTitleCase(str)
		{
		    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}


		////////////////////////////////////////////
		//Get list of sheets in app
		var sheetinfo = qlik.navigation.sheets;

		var arrayLength = sheetinfo.length;

		var cleansheetinfo = [];
		for (var i = 0; i < arrayLength; i++) {


		cleansheetinfo.push({'sheetname':sheetinfo[i].qData.title,'sheetID':sheetinfo[i].qInfo.qId});
		    //Do something
		}
		////////////////////////////////////////////


		function TalkToQlikNotification(notificationstring, notificationtype, notificationmode) {

			if(notificationmode==true) {

				if(notificationtype=='OK') {

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
					qContextMode:"CurrentSelections",
					qDebugMode:true
				}
			},

			definition: Props,
			paint: function($element, layout) {
				//add your rendering code here
				//$element.html( "TalktoQlik" );
				//console.log($('#myonoffswitch').is(':checked'));


				if(layout.DefaultMode==true) {

					var HTMLcontent = '<div class="onoffswitch"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" checked><label class="onoffswitch-label" for="myonoffswitch"><span class="onoffswitch-inner"></span><span class="onoffswitch-switch"></span></label></div><div id="TalkToQlikNotificationDiv"></div>';


				} else {
					annyang.resume();
					var HTMLcontent = '<div id="TalkToQlikNotificationDiv"></div>';

				}


				$element.html(HTMLcontent);


				if(layout.DebugMode==undefined) {
				var debugmode = false;


				} else {
					var debugmode = layout.DebugMode;
				}


				if(debugmode==true) {
					logger.enableLogger();
				} else {
					logger.disableLogger();
				}


				if(layout.ContextMode==undefined) {
					var contextmode = 'CurrentSelections';
				} else {
					var contextmode = layout.ContextMode;
				}




				///////////////////////////////////////////////////
		    	if (annyang) {

annyang.addCallback('result', function () {
  console.log('Listening');
TalkToQlikNotification('Listening...', 'temp',layout.NotificationMode);


});

					// Let's define a command.
				  var commands = {
				    'say hello': function() { 

						TalkToQlikNotification('Said Hello', 'OK',layout.NotificationMode);

				    	alert('Hello world!'); 
				    	console.log('Hello world!');
				    },

					'clear selection': function() {

						TalkToQlikNotification('Clear All', 'OK',layout.NotificationMode);
						app.clearAll();
					},
					'go forward': function() {
						app.forward();
						TalkToQlikNotification('Go Forward', 'OK',layout.NotificationMode);
					},
					'go back': function() {
						app.back();
						TalkToQlikNotification('Go Back', 'OK',layout.NotificationMode);
					},
					'lock': function() {
						app.lockAll();
						TalkToQlikNotification('Lock App', 'OK',layout.NotificationMode);
					},
					'unlock': function() {
						TalkToQlikNotification('Unlock App', 'OK',layout.NotificationMode);
						app.unlockAll();},
					'reload app': function() {
						TalkToQlikNotification('Reload App', 'OK',layout.NotificationMode);
						app.doReload();},
					'search for *term': function(term){
					  


					  console.log('Search Term: ' + term);
							
					var notification = 'Searching for ' + term;
					
					TalkToQlikNotification(notification, 'NoFade');

					   var searchvalues =[term];
					  
					  	console.log(searchvalues);




					  
					  	app.model.waitForOpen.promise.then(function(){
						
						app.global.session.rpc({"method":"SelectAssociations","handle":1,"params":[{"qContext":contextmode},searchvalues,0]}).then(function(data){


							console.log(data);


							var notification = 'Searched for ' + term;

							TalkToQlikNotification(notification, 'OK',layout.NotificationMode);

						});



					  });									  
					
					},

					'clear *fieldname': function(fieldname){

					  app.field(toTitleCase(fieldname)).clear();
					  console.log('Clear ' + fieldname);
							
						var notification ='Cleared ' + fieldname;				  
						TalkToQlikNotification(notification, 'OK',layout.NotificationMode);				 							  
					
					},

					'lock *fieldname': function(fieldname){

					  app.field(toTitleCase(fieldname)).lock();
					  console.log('Lock ' + fieldname);
							
					   var notification ='Locked ' + fieldname;					  
					 							  
					
					},

					'unlock *fieldname': function(fieldname){

					  app.field(toTitleCase(fieldname)).unlock();
					  console.log('Unlock ' + fieldname);
							
					   var notification ='Unlocked ' + fieldname;					  
					 							  
					
					},

					'select alternative *fieldname': function(fieldname){

					  app.field(toTitleCase(fieldname)).selectAlternative();
					  console.log('Select Alternative ' + fieldname);
							
					   var notification ='Selected Alternative ' + fieldname;						  
					 							  
					
					},

					'select excluded *fieldname': function(fieldname){

					  app.field(toTitleCase(fieldname)).selectExcluded();
					  console.log('Select Excluded ' + fieldname);
							
					   var notification ='Selected Excluded ' + fieldname;					  
					 							  
					
					},

					'show me *sheetname': function(sheetname){




					var cleansheetname = toTitleCase(sheetname);

					console.log('Navigate to sheet ' + cleansheetname);
							
					var results = cleansheetinfo.filter(function (entry) { return entry.sheetname === cleansheetname; });				  
					
					var notification ='Navigate to sheet ' + cleansheetname;


					//if no sheet found set notification

					Routing.goToSheet(results[0].sheetID);				 							  
					
					},				


				};



				$("#myonoffswitch").change(function() {

				//console.log(debugmode + ' ' + contextmode);

					if($('#myonoffswitch').is(':checked')==true) {
						annyang.resume();
						console.log('resume voice control');
						TalkToQlikNotification('Voice control enabled', 'OK',layout.NotificationMode);			
					} else {
						annyang.pause();
						console.log('pause voice control');
						TalkToQlikNotification('Voice control disabled', 'OK',layout.NotificationMode);
					}


				});		



				// Add our commands to annyang
				annyang.addCommands(commands);

				// Start listening.
				annyang.start();

				TalkToQlikNotification('Voice control enabled', 'OK',layout.NotificationMode);


			} else {
				

				TalkToQlikNotification('Voice control not supported, use Chrome', 'Error',layout.NotificationMode);
				var HTMLcontent = 'Voice control not supported, use Chrome';
				$element.html(HTMLcontent);
				console.log('Voice control not supported, use Chrome');
			}


		}//end return
		  ////////////////////////////////////////////////////////

	}//close function
}
); //close define

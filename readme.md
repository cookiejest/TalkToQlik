#Commands:
See full description at (http://www.webofwork.com/qlik-sense-voice-control-extension-for-accessibility)

You can say the following things to your app and it should work assuming you have given the page access to your microphone:

> Say hello

Prompts user with hello world
> Clear Selection
Clears current selection
- 'go forward' - go forward selection
- 'go back' - Go back selection
- 'lock selection' - Lock the current selection
- 'unlock selection' - Unlock current selection
- 'reload app' - Reload App
- 'search for *term' - Search for the given term, selects first associated value
- 'clear *fieldname' - Clear specific field name
- 'lock *fieldname' - Lock specific field name
- 'unlock *fieldname' - Unlock specific field name
- 'select alternative *fieldname' - select alternative value within the specific fieldname
- 'select excluded *fieldname' - select excluded within specific field name
- 'show me *sheetname' - navigate to another sheet with the given field name.

#Prerequisites
- Need to use chrome
- Need  Microphone
- User must enable microphone
- Need to speak English
- Extension needs to be on the landing page of the app before voice control can kick in
- Field names need to be be capitalised 'Customer Name' not 'customer name'
- Needs to be through Chrome. So wont work in native Qlik Sense Desktop. You can just start qlik sense desktop and then navigate to http://localhost:4848/hub in Chrome.

#Known Limitations

1. Currently this will *only work in Chrome* and browsers that support the SpeechRecognition standard. This does not include IE11 or firefox yet.

2. The app uses capitalized field names and sheet names
	A. 'Top Customers' will work as a sheet name but 'top customers' will not.
	B. 'Customer Name' will work as a field name but  'customer name' will not.

3. Current the extension only supports English feel free to add your own languages, as long as they are supported by the annyang library then its all good.

#Settings

##Switch Settings

This will enable you to use the switch or just have it turned on by default when the extension is on the page

##Notifications

This notifies the user in the extension what action the voice control has taken. This setting disables and enables it

##Selection Context Mode

When doing searches currently it is using CurrentSelections as the context mode by default, this can be changed in the settings. In this mode, the current selections are kept (if any). Search for one or more terms in the values of the app. New selections are made on top of the current selections. Other options are:

1. Cleared: In this mode, the first step is to clear any current selections in the app. The second step is to search for one or more terms in the values of the app.

2. LockedFieldsOnly: In this mode, the search applies only to the values associated with the selections made in locked fields, ignoring selections in any unlocked field. If no locked fields, the behavior is identical to the Cleared context. You cannot make any new selections in a locked field. You can get search hits for the associated values of a locked field but you cannot get the search hits for the non associative values.

3. CurrentSelections (Default): In this mode, the current selections are kept (if any). Search for one or more terms in the values of the app. New selections are made on top of the current selections. If no selections were made before the search, this mode is identical to the Cleared context.


##Debug Mode

Debug mode will turn on/off the console logging inside the developer tools so you can see whats going on.


#Credits:
It uses the open source annyang voice recognition library.

##Other Contributors:
Nick Webster
Adeel Khaan

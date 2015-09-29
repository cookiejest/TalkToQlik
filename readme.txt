#Commands:
See full description at http://www.webofwork.com/qlik-sense-voice-control-extension-for-accessibility

You can say the following things to your app and it should work assuming you have given the page access to your microphone:


'say hello' - Prompts user with hello world
'clear selection' - Clears current selection
'go forward' - go forward selection
'go back' - Go back selection
'lock selection' - Lock the current selection
'unlock selection' - Unlock current selection
'reload app' - Reload App
'search for *term' - Search for the given term, selects first associated value
'clear *fieldname' - Clear specific field name
'lock *fieldname' - Lock specific field name
'unlock *fieldname' - Unlock specific field name
'select alternative *fieldname' - select alternative value within the specific fieldname
'select excluded *fieldname' - select excluded within specific field name
'show me *sheetname' - navigate to another sheet with the given field name.

#Known limitations and notes

1. Currently this will *only work in Chrome* and browsers that support the SpeechRecognition standard. This does not include IE11 or firefox yet.

2. The app uses capitalized field names and sheet names
	A. 'Top Customers' will work as a sheet name but 'top customers' will not.
	B. 'Customer Name' will work as a field name but  'customer name' will not.

3. Current the extension only supports English feel free to add your own languages, as long as they are supported by the annyang library then its all good.

4. The extension needs to be on the first page that is navigated or activated before it will then work across the app. May be worth putting the extension on every sheet.

5. When doing searches currently it is using CurrentSelections as the context mode by default, this can be changed in the settings. In this mode, the current selections are kept (if any). Search for one or more terms in the values of the app. New selections are made on top of the current selections. Other options are:

	A. Cleared: In this mode, the first step is to clear any current selections in the app. The second step is to search for one or more terms in the values of the app.

	B. LockedFieldsOnly: In this mode, the search applies only to the values associated with the selections made in locked fields, ignoring selections in any unlocked field. If no locked fields, the behavior is identical to the Cleared context. You cannot make any new selections in a locked field. You can get search hits for the associated values of a locked field but you cannot get the search hits for the non associative values.

	C. CurrentSelections (Default): In this mode, the current selections are kept (if any). Search for one or more terms in the values of the app. New selections are made on top of the current selections. If no selections were made before the search, this mode is identical to the Cleared context.

4. Currently you need to be accessing through a browser - IT WILL NOT WORK THROUGH SENSE DESKTOP app. You can start qlik sense desktop and then go to localhost:4848/hub and it will work. This is because need permission to use your microphone through your browser.


#Credits:
It uses the open source annyang voice recognition library.

##Other Contributors:
Nick Webster
Adeel Khaan
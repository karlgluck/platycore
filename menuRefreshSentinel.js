
function menuRefreshSentinel ()
   {
   menuStopSentinel();
   ScriptApp.newTrigger('triggerPlatycoreSentinel').timeBased().everyMinutes(5).create();
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }

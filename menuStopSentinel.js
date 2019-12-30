
function menuStopSentinel ()
   {
   GAS_deleteTriggerByName('triggerPlatycoreSentinel');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }
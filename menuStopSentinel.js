
function menuStopSentinel ()
   {
   platycoreVerifyPermissions();
   GAS_deleteTriggerByName('triggerBlockPump');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }
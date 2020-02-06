
function menuStopSentinel ()
   {
   platycoreVerifyPermissions();
   GAS_DeleteTriggerByName('triggerBlockPump');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }
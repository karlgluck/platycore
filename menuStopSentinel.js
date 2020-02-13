
function menuStopSentinel ()
   {
   platycoreVerifyPermissions();
   GAS.DeleteTriggerByName('triggerBlockPump');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }
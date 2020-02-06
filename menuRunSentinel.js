function menuRunSentinel ()
   {
   platycoreVerifyPermissions();
   try
      {
      GAS_DeleteTriggerByName('triggerBlockPump');
      ScriptApp.newTrigger('triggerBlockPump').timeBased().everyMinutes(5).create();
      SpreadsheetApp.getActiveSpreadsheet().toast('There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
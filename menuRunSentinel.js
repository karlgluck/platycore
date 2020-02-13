function menuRunSentinel ()
   {
   platycoreVerifyPermissions();
   try
      {
      GAS.DeleteTriggerByName('triggerBlockPump');
      ScriptApp.newTrigger('triggerBlockPump').timeBased().everyMinutes(5).create();
      SpreadsheetApp.getActiveSpreadsheet().toast('There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
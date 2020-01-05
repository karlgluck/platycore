function menuRunSentinel ()
   {
   try
      {
      GAS_deleteTriggerByName('triggerBlockPump');
      triggerBlockPump();
      SpreadsheetApp.getActiveSpreadsheet().toast('There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
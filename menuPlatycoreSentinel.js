function menuPlatycoreSentinel ()
   {
   try
      {
      triggerPlatycoreSentinel();
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
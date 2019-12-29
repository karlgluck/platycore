
function menuUninstallAgent()
   {
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet());
      agent.Uninstall();
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
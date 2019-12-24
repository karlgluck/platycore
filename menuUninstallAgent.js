
function menuUninstallAgent()
   {
   var agent = new Agent(SpreadsheetApp.getActiveSheet());
   agent.uninstall();
   }
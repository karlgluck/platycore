
function menuReinstallAgent()
   {
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet());
      var kAgentId = agent.GetAgentId();
      agent.Uninstall();
      newAgent(urlAgentInstructions, kAgentId);
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast('Reinstall failed: ' + e + ' ' + e.stack);
      console.log('Reinstall failed: ' + e + ' ' + e.stack, e.stack);
      throw e;
      }
   }
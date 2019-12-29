
function menuReinstallAgent()
   {
   var sheet = SpreadsheetApp.getActiveSheet();
   try   // first, attempt to uninstall the agent
      {  // the clean way using the API
      var agent = new Agent(sheet);
      var urlAgentInstructions = agent.UrlAgentInstructionsGet();
      agent.Uninstall();
      }
   catch (e)
      {
      try  // fall back to just finding the raw platycore settings
         { // for the sheet and deleting the sheet
         var memory = JSON.parse(PropertiesService.getDocumentProperties().getProperty('platycoreAgent' + sheet.getSheetId()));
         var urlAgentInstructions = memory.urlAgentInstructions;
         sheet.getParent().deleteSheet(sheet);
         }
      catch (e)
         {
         SpreadsheetApp.getActiveSpreadsheet().toast('Uninstall failed: ' + e + ' ' + e.stack);
         return;
         }
      }
   try
      {
      newAgent(urlAgentInstructions, 'menuReinstallAgent');
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast('Install failed: ' + e + ' ' + e.stack);
      return;
      }
   }
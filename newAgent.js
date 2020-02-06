
function newAgentFromText(text)
   {
   newAgent('data:text/plain;base64,' + Util_GetBase64FromString(text), null, 'newAgentFromText');
   }

function newAgent (urlAgentInstructions, previousInstallMemory, origin)
   {

   var spreadsheet = SpreadsheetApp.getActive();

   var sheetName = 'New Agent';

   var sheet = spreadsheet.getSheetByName(sheetName);
   if (!!sheet)
      {
      spreadsheet.deleteSheet(sheet);
      }
   sheet = spreadsheet.insertSheet(sheetName, spreadsheet.getActiveSheet().getIndex());
   var agentName = 'platycoreAgent' + sheet.getSheetId();
   PropertiesService.getDocumentProperties().setProperty(agentName, JSON.stringify({urlAgentInstructions:urlAgentInstructions})); // save a minimal agent first so that reinstall always works
   sheet.activate();
   sheet.insertColumns(1, 23); // add to the default 26 columns (A-Z)
   sheet.setColumnWidths(1, 49, sheet.getRowHeight(1)); // square the cells

   try
      {
      var utsAgentCreated = Util_GetTimestampNow();
      var agent = new Agent(sheet, {
            memory: {
                  agentName: agentName,
                  fieldFromName: {},
                  noteFromName: {},
                  scriptFromName: {},
                  scriptNames: [],
                  sheetNameHint: sheetName,
                  sheetId: sheet.getSheetId(),
                  toggleFromName: {},
                  urlAgentInstructions: urlAgentInstructions
                  },
            previousInstallMemory: previousInstallMemory,
            origin: origin || 'newAgent',
            utsSheetLastUpdated: utsAgentCreated
            });
      agent.OverrideTurnOn();
      agent.Save();
      agent = agent.ExecuteRoutineFromUrl(urlAgentInstructions);
      }
   catch (e)
      {
      console.error(e, e.stack);
      spreadsheet.toast(e + ' ' + e.stack);
      try
         {
         agent.Error('exception during agent initialization', e, e.stack);
         }
      catch (e2)
         {
         console.error(e2, e2.stack);
         }
      return;
      }
   finally
      {
      try
         {
         agent.Save();
         spreadsheet.toast('platycoreAgent' + sheet.getSheetId() + ' installed successfully. There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
         }
      catch (e)
         {
         console.error(e, e.stack);
         }
      }

   return agent;
   }
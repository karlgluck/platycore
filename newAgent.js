
function newAgentFromText(text)
   {
   newAgent('data:application/x-gzip;base64,' + Lang.GetBase64GzipFromString(text), null, 'newAgentFromText');
   }

function newAgent (urlAgentInstructions, kPreviousAgentId)
   {

   var spreadsheet = SpreadsheetApp.getActive();

   var sheetName = 'New Agent';

   var sheet = spreadsheet.getSheetByName(sheetName);
   if (!!sheet)
      {
      spreadsheet.deleteSheet(sheet);
      }
   sheet = spreadsheet.insertSheet(sheetName, spreadsheet.getActiveSheet().getIndex());
   sheet.getRange('A1').insertCheckboxes().check().setNote(
      '  INTERACTIVE_ONLY' // prevent automation from running this code accidentally
      + (Lang.IsMeaningful(kPreviousAgentId) ? '\n  UPGRADE "' + kPreviousAgentId + '"' : '')
      + '\n  INSTALL "' + urlAgentInstructions + '"'
      );
   sheet.activate();

   try
      {
      var agent = new Agent(sheet);
      agent.Preboot();
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

   return agent;
   }
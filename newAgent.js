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
   PropertiesService.getDocumentProperties().setProperty('platycoreAgent' + sheet.getSheetId(), JSON.stringify({urlAgentInstructions:urlAgentInstructions})); // Save a minimal agent first so that reinstall always works
   sheet.activate();
   sheet.insertColumns(1, 23); // add to the default 26 columns (A-Z)
   sheet.setColumnWidths(1, 49, sheet.getRowHeight(1)); // square the cells

   try
      {
      var utsNow = Util_utsNowGet();
      var agent = new Agent(sheet, {
            forceThisOn: true,
            memory: {
                  fieldFromName: {},
                  noteFromName: {},
                  scriptFromName: {},
                  scriptNames: [],
                  sheetName: sheetName,
                  sheetId: sheet.getSheetId(),
                  toggleFromName: {},
                  urlAgentInstructions: urlAgentInstructions,
                  utsLastSaved: utsNow
                  },
            origin: origin || 'newAgent',
            utsNow: utsNow,
            utsSheetLastUpdated: utsNow,
            verbose: true
            });
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
         var utsWakeValue = agent.ReadField('WAKE');
         if (Util_isNumber(utsWakeValue))
            {
            var dtMilliseconds = Math.max(15000, (utsWakeValue - Util_utsNowGet()) / 1000);
            console.log('Scheduling sentinel after ' + Util_stopwatchStringFromDurationInMillis(dtMilliseconds) + ' = ' + dtMilliseconds);
            ScriptApp.newTrigger('triggerBlockPump').timeBased().after(dtMilliseconds).everyMinutes(5).create();
            }
         spreadsheet.toast('platycoreAgent' + sheet.getSheetId() + ' installed successfully. There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
         }
      catch (e)
         {
         console.error(e, e.stack);
         }
      }

   return agent;
   }


var utsPlatycoreNow = Util_utsNowGet(); // fix the "now" point in time so that changes get picked up while this sentinel executes

function triggerPlatycoreSentinel ()
   {
   GAS_deleteTriggerByName('triggerPlatycoreSentinel');
   // TODO: re-schedule the sentinel
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var file = DriveApp.getFileById(spreadsheet.getId());
   var properties = PropertiesService.getDocumentProperties();
   var platycore = JSON.parse(properties.getProperty('platycore') || '{}');
   var keys = properties.getKeys()
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' });


   // TODO: this loop continues going as long as any agent is GO

   for (var iKey = 0, nKeyCount = keys.length; iKey < nKeyCount; ++iKey)
      {
      
      var utsLastUpdated = file.getLastUpdated().getTime();
      var isPlatycoreMemoryLatest = platycore.hasOwnProperty('utsLastSaved') && (platycore.utsLastSaved >= utsLastUpdated);

      var ePlatycoreAgentKey = keys[iKey];
      var sheet = undefined;
      var agentMemory = JSON.parse(properties.getProperty(ePlatycoreAgentKey));
      if (!isPlatycoreMemoryLatest)
         {
         console.log('syncing platycore memory with ' + ePlatycoreAgentKey, agentMemory);
         if (agentMemory.hasOwnProperty('sheetName')) // use the sheetName hint for direct lookup
            {
            sheet = spreadsheet.getSheetByName(agentMemory.sheetName);
            console.log('sheet = ' + (!!sheet ? '' + sheet.getSheetId(): 'null'));
            if (!sheet || sheet.getSheetId() != agentMemory.sheetId)
               {
               console.warn(ePlatycoreAgentKey + ' sheet had the wrong ID');
               sheet = undefined;
               }
            }
         if ('undefined' === typeof sheet) // if sheetName didn't find it, search by sheetId (and repair sheetName)
            {
            sheet = (function (sheets, kTargetSheetId) 
               {
                  for (var iSheet = 0, nSheetCount = sheets.length; iSheet < nSheetCount; ++iSheet)
                     {
                     var eSheet = sheets[iSheet];
                     if (eSheet.getSheetId() == kTargetSheetId)
                        {
                        return eSheet;
                        }
                     }
                  return null;
               })(spreadsheet.getSheets(), agentMemory.sheetId);
            console.log(ePlatycoreAgentKey + ': sheet found by agent ID = ' + (!!sheet ? '' + sheet.getSheetName(): 'null'));
            if ('object' === typeof sheet && null !== sheet) // if we got a valid sheet back, update the agent memory to save its new name
               {
               agentMemory.sheetName = sheet.getSheetName();
               properties.setProperty(ePlatycoreAgentKey, JSON.stringify(agentMemory));
               }
            }
         if ('object' !== typeof sheet || null === sheet) // nuke an invalid platycore agent
            {
            console.error('platycore: deleting invalid platycore agent "' + ePlatycoreAgentKey + '"',ePlatycoreAgentKey);
            properties.deleteProperty(ePlatycoreAgentKey);
            continue;
            }
         var go = agentMemory.toggleFromName.GO;
         go.valueCached = !!sheet.getRange(go.r, go.c).getValue();
         if (agentMemory.fieldFromName.hasOwnProperty('WAKE'))
            {
            var wake = agentMemory.fieldFromName.WAKE;
            wake.valueCached = sheet.getRange(wake.r, wake.c).getValue();
            }
         }
      
      var isIdle = true !== agentMemory.toggleFromName.GO.valueCached;
      var shouldWake = agentMemory.fieldFromName.hasOwnProperty('WAKE') && agentMemory.fieldFromName.WAKE.valueCached < utsPlatycoreNow;
      console.log('agent ' + ePlatycoreAgentKey + ': ' + (isIdle?(shouldWake?'WAKE':'IDLE'):'UPDATE'), agentMemory);
      if (isIdle && !shouldWake)
         {
         return;
         }
      if ('object' !== typeof sheet || null === sheet)
         {
         sheet = spreadsheet.getSheetByName(agentMemory.sheetName);
         }
      try{
         var agent = new Agent(sheet, {origin:'triggerPlatycoreSentinel',utsSheetLastUpdated: utsLastUpdated, memory: agentMemory});
         if (agent.TurnOn())
            {
            try{
               agent.Step();
               }
            catch (e)
               {
               agent.Error(ePlatycoreAgentKey + ': Step', e, e.stack);
               }
            finally
               {
               agent.TurnOff();
               }
            }
         }
      catch (e)
         {
         console.error(e, e.stack);
         throw e;
         }
      }

   platycore.utsLastUpdated = utsPlatycoreNow;
   properties.setProperty('platycore', JSON.stringify(platycore));
   }


function triggerPlatycoreSentinel ()
   {
   GAS_deleteTriggerByName('triggerPlatycoreSentinel');
   // TODO: re-schedule the sentinel
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var file = DriveApp.getFileById(spreadsheet.getId());
   var properties = PropertiesService.getDocumentProperties();
   var utsNow = new Date().getTime();
   var platycore = JSON.parse(properties.getProperty('platycore') || '{}');
   var keys = properties.getKeys()
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' });


   // TODO: this loop continues going as long as any agent is GO

   for (var iKey = 0, nKeyCount = keys.length; iKey < nKeyCount; ++iKey)
      {
      
      var utsLastUpdated = file.getLastUpdated().getTime();
      var isPlatycoreMemoryLatest = platycore.hasOwnProperty('utsLastSaved') && (platycore.utsLastSaved >>> 0) >= 
      utsLastUpdated;

      var ePlatycoreAgentKey = keys[iKey];
      var sheet = undefined;
      var eAgentMemory = JSON.parse(properties.getProperty(ePlatycoreAgentKey));
      if (!isPlatycoreMemoryLatest)
         {
         console.log('syncing platycore memory with ' + ePlatycoreAgentKey, eAgentMemory);
         if (eAgentMemory.hasOwnProperty('sheetName')) // use the sheetName hint for direct lookup
            {
            sheet = spreadsheet.getSheetByName(eAgentMemory.sheetName);
            console.log('sheet = ' + (!!sheet ? '' + sheet.getSheetId(): 'null'));
            if (!sheet || sheet.getSheetId() != eAgentMemory.sheetId)
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
               })(spreadsheet.getSheets(), eAgentMemory.sheetId);
            console.log(ePlatycoreAgentKey + ': sheet found by agent ID = ' + (!!sheet ? '' + sheet.getSheetName(): 'null'));
            if ('object' === typeof sheet && null !== sheet) // if we got a valid sheet back, update the agent memory to save its new name
               {
               eAgentMemory.sheetName = sheet.getSheetName();
               properties.setProperty(ePlatycoreAgentKey, JSON.stringify(eAgentMemory));
               }
            }
         if ('object' !== typeof sheet || null === sheet) // nuke an invalid platycore agent
            {
            console.error('platycore: deleting invalid platycore agent "' + ePlatycoreAgentKey + '"',ePlatycoreAgentKey);
            properties.deleteProperty(ePlatycoreAgentKey);
            continue;
            }
         var go = eAgentMemory.toggleFromName.GO;
         var goValue = !!sheet.getRange(go.r, go.c).getValue();
         if (goValue !== go.valueCached)
            {
            go.valueCached = goValue;
            properties.setProperty(ePlatycoreAgentKey, JSON.stringify(eAgentMemory));
            }
         }
      
      var isIdle = true !== eAgentMemory.toggleFromName.GO.valueCached;
      console.log('agent ' + ePlatycoreAgentKey + ': ' + (isIdle?'IDLE':'SHOULD UPDATE'), eAgentMemory);
      if (isIdle)
         {
         return;
         }
      if ('object' !== typeof sheet || null === sheet)
         {
         sheet = spreadsheet.getSheetByName(eAgentMemory.sheetName);
         }
      try{
         var agent = new Agent(sheet, utsLastUpdated, eAgentMemory, {});
         var sentinel = Utilities.base64Encode(Math.random().toString());
         var sentinelRange = sheet.getRange(1, 49);
         sentinelRange.setValue(sentinel);
         if (agent.turnOn() && sentinel === sentinelRange.getValue())
            {
            try{
               agent.step();
               }
            catch (e)
               {
               agent.error(ePlatycoreAgentKey + ': UPDATE', e, e.stack);
               }
            finally
               {
               agent.turnOff();
               }
            }
         }
      catch (e)
         {
         console.error(e);
         throw e;
         }
      }

   platycore.utsLastUpdated = new Date().getTime();
   properties.setProperty('platycore', JSON.stringify(platycore));
   }

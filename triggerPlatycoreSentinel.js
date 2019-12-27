
function triggerPlatycoreSentinel ()
   {
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var file = DriveApp.getFileById(spreadsheet.getId());
   var properties = PropertiesService.getDocumentProperties();
   file.getLastUpdated().getTime();
   var platycore = JSON.parse(properties.getProperty('platycore') || '{}');
   var isAgentMemoryLatest = platycore.hasOwnProperty('utsLastUpdated') && (platycore.utsLastUpdated >>> 0) >= file.getLastUpdated().getTime();
   var keys = properties.getKeys()
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' });
   for (var iKey = 0, nKeyCount = keys.length; iKey < nKeyCount; ++iKey)
      {
      var ePlatycoreAgentKey = keys[iKey];
      var sheet = undefined;
      var eAgentMemory = JSON.parse(properties.getProperty(ePlatycoreAgentKey));
      if (!isAgentMemoryLatest)
         {
         console.log('updating agent memory for ' + ePlatycoreAgentKey, eAgentMemory);
         if (eAgentMemory.hasOwnProperty('sheetName')) // use the sheetName hint for direct lookup
            {
            sheet = spreadsheet.getSheetByName(eAgentMemory.sheetName);
            console.log('sheet = ' + (!!sheet ? '' + sheet.getSheetId(): 'null'));
            if (!sheet || sheet.getSheetId() != eAgentMemory.sheetId)
               {
               console.warn('sheet had the wrong ID');
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
                     console.warn('looking for ' + kTargetSheetId + ' comparing to ' + eSheet.getSheetId() + ' named ' + eSheet.getSheetName());
                     if (eSheet.getSheetId() == kTargetSheetId)
                        {
                        return eSheet;
                        }
                     }
                  return null;
               })(spreadsheet.getSheets(), eAgentMemory.sheetId);
            console.log('sheet found by ID = ' + (!!sheet ? '' + sheet.getSheetName(): 'null'));
            if ('object' === typeof sheet && null !== sheet) // if we got a valid sheet back, update the agent memory to save its new name
               {
               eAgentMemory.sheetName = sheet.getSheetName();
               properties.setProperty(ePlatycoreAgentKey, JSON.stringify(eAgentMemory));
               }
            }
         if ('object' !== typeof sheet || null === sheet) // nuke an invalid platycore agent
            {
            console.error('deleting invalid platycore agent "' + ePlatycoreAgentKey + '"');
            properties.deleteProperty(ePlatycoreAgentKey);
            continue;
            }
         var go = eAgentMemory.toggleFromName.GO;
         var shouldUpdate = !!sheet.getRange(go.r, go.c).getValue();
         if (shouldUpdate !== eAgentMemory.shouldUpdate)
            {
            eAgentMemory.shouldUpdate = shouldUpdate;
            properties.setProperty(ePlatycoreAgentKey, JSON.stringify(eAgentMemory));
            }
         }
      
      var isIdle = true !== eAgentMemory.shouldUpdate;
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
         var agent = new Agent(sheet, eAgentMemory, {});
         var sentinel = Utilities.base64Encode(Math.random().toString());
         var sentinelRange = sheet.getRange(1, 49);
         sentinelRange.setValue(sentinel);
         var turnedOn = agent.turnOn();
         var sentinelAfter = sentinelRange.getValue();
         console.log('sentinel before', sentinel);
         console.log('turnedOn',turnedOn);
         console.log('sentinel after', sentinelAfter);
         if (turnedOn && sentinel === sentinelAfter)
            {
            console.warn(ePlatycoreAgentKey + ': agent online');
            try{
               // DONE RUN THE THING NOW
               console.warn(ePlatycoreAgentKey + ': inside!');
               agent.log("Hello from the Platycore Sentinel!");
               }
            catch (e)
               {
               agent.error(ePlatycoreAgentKey + ': UPDATE', e, e.stack);
               }
            finally
               {
               console.warn(ePlatycoreAgentKey + ': turning off');
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

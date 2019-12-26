
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
      var eAgentMemory = JSON.stringify(properties.getProperty(ePlatycoreAgentKey));
      if (!isAgentMemoryLatest)
         {
         if (eAgentMemory.hasOwnProperty('sheetName')) // use the sheetName hint 
            {
            sheet = spreadsheet.getSheetByName(eAgentMemory.sheetName);
            if (!sheet || sheet.getSheetId() !== eAgentMemory.sheetId)
               {
               sheet = undefined;
               }
            }
         if ('undefined' === typeof sheet) // search by sheetId (and repair sheetName)
            {
            sheet = (function (sheets, kTargetSheetId) 
               {
                  for (var iSheet = 0, nSheetCount = sheets.length; iSheet < nSheetCount; ++iSheet)
                     {
                     var eSheet = sheets[iSheet];
                     if (eSheet.getSheetId() === kTargetSheetId)
                        {
                        return eSheet;
                        }
                     }
                  return null;
               })(spreadsheet.getSheets(), eAgentMemory.sheetId);
            if ('object' !== typeof sheet || null === sheet)
               {
               eAgentMemory.sheetName = sheet.getSheetName();
               properties.setProperty(ePlatycoreAgentKey, JSON.stringify(eAgentMemory));
               }
            }
         if ('object' !== typeof sheet || null === sheet) // nuke invalid platycore agent
            {
            console.warn('DELETE PLATYCORE AGENT ' + ePlatycoreAgentKey);
            properties.deleteProperty(ePlatycoreAgentKey);
            continue;
            }
         }
      eAgentMemory
      eAgentMemory.go = !!sheet.getRange(eAgentMemory.irGo || 1, eAgentMemory.icGo || 1).getValue();
      if (true !== eAgentMemory.go)
         {
         return;
         }
      if ('undefined' === typeof sheet)
         {
         sheet = spreadsheet.getSheetByName(eAgentMemory.sheetName);
         }
      var isEnabled = !!sheet.getRange(1, 3).getValue();
      if (!isEnabled)
         {
         return;
         }
      try{
         var agent = new Agent(sheet, {memory: eAgentMemory});
         var sentinel = Math.random().toString();
         var sentinelRange = sheet.getRange(1, 49);
         sentinelRange.setValue(sentinel);
         if (agent.turnOn() && sentinel === sentinelRange.getValue())
            {
            try{
               agent.log("Hello from the Platycore Sentinel!");
               }
            catch (e)
               {
               agent.error('doStep', e, e.stack);
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
         }
      }

   platycore.utsLastUpdated = new Date().getTime();
   properties.setProperty('platycore', JSON.stringify(platycore));
   }

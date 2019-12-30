

var Global_utsPlatycoreNow = Util_utsNowGet(); // fix the "now" point in time so that changes get picked up while this sentinel executes

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

   var utsNextWakeTime = Number.POSITIVE_INFINITY;

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
         console.log('[' + ePlatycoreAgentKey + ']: syncing platycore memory');
         if (agentMemory.hasOwnProperty('sheetName')) // use the sheetName hint for direct lookup
            {
            sheet = spreadsheet.getSheetByName(agentMemory.sheetName);
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
         if (!go.hasOwnProperty('fVirtual'))
            {
            go.valueCached = !!sheet.getRange(go.r, go.c).getValue();
            console.log('[' + ePlatycoreAgentKey + ']: read GO = ' + go.valueCached);
            }
         if (agentMemory.fieldFromName.hasOwnProperty('WAKE'))
            {
            var wake = agentMemory.fieldFromName.WAKE;
            if (!wake.hasOwnProperty('fVirtual'))
               {
               wake.valueCached = sheet.getRange(wake.r, wake.c).getValue();
               console.log('[' + ePlatycoreAgentKey + ']: read WAKE = ' + wake.valueCached);
               }
            }
         }
      
      var isIdle = true !== agentMemory.toggleFromName.GO.valueCached;
      if (agentMemory.fieldFromName.hasOwnProperty('WAKE'))
         {                                               // Check for a number so that we can disable
         var wake = agentMemory.fieldFromName.WAKE;      // automatic wake-up using 'SNOOZE'
         var shouldWake = Util_isNumber(wake.valueCached) && wake.valueCached < Global_utsPlatycoreNow;
         }
      else
         {
         var shouldWake = false;
         }
      console.log('agent ' + ePlatycoreAgentKey + ': ' + (isIdle?(shouldWake?'WAKE':'IDLE'):'UPDATE'), agentMemory);
      if (isIdle && !shouldWake)
         {
         if (Util_isObject(wake) && Util_isNumber(wake.valueCached))
            {
            utsNextWakeTime = Math.min(utsNextWakeTime, wake.valueCached);
            }
         return;
         }
      if ('object' !== typeof sheet || null === sheet)
         {
         sheet = spreadsheet.getSheetByName(agentMemory.sheetName);
         }
      try{
         var agent = new Agent(sheet, {
               memory: agentMemory,
               origin:'triggerPlatycoreSentinel',
               utsSheetLastUpdated: utsLastUpdated
               });
         agentMemory = null; // no longer valid
         wake = null;        // no longer valid
         if (agent.TurnOn())
            {
            try{
               agent.Step();
               var wakeValue = agent.ReadField('WAKE');
               if (Util_isNumber(wakeValue))
                  {
                  utsNextWakeTime = Math.min(utsNextWakeTime, wakeValue);
                  }
               wakeValue = null;
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
         throw e; // this is a problem because it skips the rescheduler
         }
         
      } // ePlatycoreAgentKey for every agent in the spreadsheet

   platycore.utsLastUpdated = Global_utsPlatycoreNow;
   properties.setProperty('platycore', JSON.stringify(platycore));
   GAS_deleteTriggerByName('triggerPlatycoreSentinel');
   var dtSnoozeDelay = Math.min(2/*days*/*1000*60*60*24, utsNextWakeTime - Global_utsPlatycoreNow);
   console.warn('PLATYCORE IS GOING TO SLEEP for ' + dtSnoozeDelay, new Date(Global_utsPlatycoreNow+dtSnoozeDelay).toString());
   ScriptApp.newTrigger('triggerPlatycoreSentinel')
         .timeBased()
         .after(dtSnoozeDelay)
         .create();
   }

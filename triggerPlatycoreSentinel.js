

var Global_utsPlatycoreNow = Util_utsNowGet(); // fix the "now" point in time so that changes get picked up while this sentinel executes

function triggerPlatycoreSentinel ()
   {
   GAS_deleteTriggerByName('triggerPlatycoreSentinel');

   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var file = DriveApp.getFileById(spreadsheet.getId());
   var properties = PropertiesService.getDocumentProperties();
   var platycore = JSON.parse(properties.getProperty('platycore') || '{}');
   var keys = properties.getKeys()
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' });

   var utsNextWakeTime = Number.POSITIVE_INFINITY;
   var dtSingleBlockRuntimeLimit = 60/*seconds*/ * 1000;
   var utsExecutionCutoffTime = Util_utsNowGet() + 1000 * 60 * 5 - dtSingleBlockRuntimeLimit;

   // TODO: this loop continues going as long as any agent is GO
   //
   var nKeyCount = keys.length;
   var qIterations = 0;
   var areAnyAgentsActive = true;
   var utsIterationStarted;
   while (++qIterations < 100 && ((utsIterationStarted = Util_utsNowGet()) < utsExecutionCutoffTime) && areAnyAgentsActive)
      {
      areAnyAgentsActive = false;

      var iKey = qIterations % nKeyCount;
      var ePlatycoreAgentKey = keys[iKey];

      var utsLastUpdated = file.getLastUpdated().getTime();
      var isPlatycoreMemoryLatest = platycore.hasOwnProperty('utsLastSaved') && (platycore.utsLastSaved >= utsLastUpdated);

      console.log('checking agent ' + ePlatycoreAgentKey);
      var sheet = undefined;
      var agentMemory = JSON.parse(properties.getProperty(ePlatycoreAgentKey));
      if (!isPlatycoreMemoryLatest)
         {
         console.warn('[' + ePlatycoreAgentKey + ']: syncing platycore memory (this should not happen frequently; if it does, utsLastSaved should be set further into the future when the agent terminates)');
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
      console.log('agent ' + ePlatycoreAgentKey + ': ' + (isIdle?(shouldWake?'WAKE':'IDLE'):'UPDATE'));
      if (isIdle && !shouldWake)
         {
         if (Util_isObject(wake) && Util_isNumber(wake.valueCached))
            {
            utsNextWakeTime = Math.min(utsNextWakeTime, wake.valueCached);
            console.log('agent ' + ePlatycoreAgentKey + ' is snoozing for ' + Util_stopwatchStringFromDuration(utsNextWakeTime - Global_utsPlatycoreNow), utsNextWakeTime);
            }
         }
      else
         {
         areAnyAgentsActive = true;
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
                  }
               catch (e)
                  {
                  agent.Error(ePlatycoreAgentKey + ': Step', e, e.stack);
                  }
               finally
                  {
                  var wakeValue = agent.ReadField('WAKE');
                  if (Util_isNumber(wakeValue))
                     {
                     utsNextWakeTime = Math.min(utsNextWakeTime, wakeValue);
                     }
                  wakeValue = null;
                  var dtRuntime = Util_utsNowGet() - utsIterationStarted;
                  if (dtRuntime > dtSingleBlockRuntimeWarningThreshold)
                     {
                     agent.Warn('agent is running for too long')
                     }
                  else if (dtRuntime > dtSingleBlockRuntimeLimit)
                     {
                     }
                  agent.TurnOff();
                  }
               }
            } // try - running the agent through a cycle
         catch (e)
            {
            console.error(e, e.stack);
            throw e; // this is a problem because it skips the rescheduler
            }
         } // is GO or wake
         
      } // ePlatycoreAgentKey for every agent in the spreadsheet until runtime is hit
   
   // update the save 

   platycore.utsLastSaved = Global_utsPlatycoreNow;
   properties.setProperty('platycore', JSON.stringify(platycore));
   GAS_deleteTriggerByName('triggerPlatycoreSentinel');
   var dtSnoozeDelay = Math.max(0, Math.min(2/*days*/*1000*60*60*24, utsNextWakeTime - Global_utsPlatycoreNow));
   console.warn('Platycore is going to sleep for ' + Util_stopwatchStringFromDuration(dtSnoozeDelay), new Date(Global_utsPlatycoreNow+dtSnoozeDelay).toString());
   ScriptApp.newTrigger('triggerPlatycoreSentinel')
         .timeBased()
         .after(dtSnoozeDelay)
         .create();
   }

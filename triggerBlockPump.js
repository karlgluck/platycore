
function triggerBlockPump ()
   {
   //doBlockPump();
   }

function doBlockPump (isSingleBlock)
   {
   isSingleBlock = Util_boolCast(isSingleBlock);

   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var file = DriveApp.getFileById(spreadsheet.getId());
   var properties = PropertiesService.getDocumentProperties();
   var platycore = JSON.parse(properties.getProperty('platycore') || '{}');
   var keys = properties.getKeys()
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' });

   var dtSingleBlockRuntimeLimit = 60/*seconds*/ * 1000;
   var utsExecutionCutoffTime = Util_utsNowGet() + 1000 * 60 * 5 - dtSingleBlockRuntimeLimit; // print an error if any agent executes longer than this time
   var dtSingleBlockRuntimeWarningThreshold = 0.70/*percent*/ * dtSingleBlockRuntimeLimit; // print a warning if the agent runs longer than this time

   var nKeyCount = keys.length;
   var qIterations = 0;
   var utsIterationStarted;
   var mIterations = 1000*60*5;
   while (qIterations++ < mIterations && ((utsIterationStarted = Util_utsNowGet()) < utsExecutionCutoffTime))
      {

      var iKey = qIterations % nKeyCount;
      var ePlatycoreAgentKey = keys[iKey];

      var utsLastUpdated = file.getLastUpdated().getTime();
      var isPlatycoreMemoryLatest = platycore.hasOwnProperty('utsLastSaved') && (platycore.utsLastSaved >= utsLastUpdated);

      var sheet = undefined;
      var agentMemoryString = properties.getProperty(ePlatycoreAgentKey);
      if (null === agentMemoryString)
         {
         // ignore this agent; it disappeared
         properties.deleteProperty(ePlatycoreAgentKey);
         }
      var agentMemory = JSON.parse(agentMemoryString);
      console.log('checking agent ' + ePlatycoreAgentKey);
      console.log('agent memory ==>', agentMemory);
      var wake = null;
      if (!isPlatycoreMemoryLatest)
         {
         console.warn('[' + ePlatycoreAgentKey + ']: syncing platycore memory (this should not happen frequently; if it does, utsLastSaved should be set further into the future when the agent terminates)');
         if (agentMemory.hasOwnProperty('sheetNameHint')) // use the sheetNameHint for direct lookup
            {
            sheet = spreadsheet.getSheetByName(agentMemory.sheetNameHint);
            if (!sheet || sheet.getSheetId() != agentMemory.sheetId)
               {
               console.warn(ePlatycoreAgentKey + ' sheet with name "' + agentMemory.sheetNameHint + '" had the wrong sheet name hint; fixing');
               sheet = undefined;
               }
            }
         if (!Util_isObject(sheet)) // if sheetName didn't find it, search by sheetId (and repair sheetName)
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
            if (Util_isObject(sheet)) // if we got a valid sheet back, update the agent memory to save its new name
               {
               agentMemory.sheetNameHint = sheet.getSheetName();
               properties.setProperty(ePlatycoreAgentKey, JSON.stringify(agentMemory));
               }
            }
         if (!Util_isObject(sheet)) // nuke an invalid agent
            {
            console.error('platycore: deleting invalid platycore agent "' + ePlatycoreAgentKey + '"', ePlatycoreAgentKey);
            properties.deleteProperty(ePlatycoreAgentKey);
            continue;
            }
         var go = agentMemory.toggleFromName.GO;
         if (!go.hasOwnProperty('fVirtual'))
            {
            go.valueCached = Util_boolCast(sheet.getRange(go.r, go.c).getValue());
            console.log('[' + ePlatycoreAgentKey + ']: read GO = ' + go.valueCached);
            }
         if (agentMemory.fieldFromName.hasOwnProperty('WAKE'))
            {
            wake = agentMemory.fieldFromName.WAKE;
            if (!wake.hasOwnProperty('fVirtual'))
               {
               wake.valueCached = Util_intCast(sheet.getRange(wake.r, wake.c).getValue());
               }
            console.log('[' + ePlatycoreAgentKey + ']: read WAKE = ' + wake.valueCached);
            }
         }
      
      var isIdle = true !== agentMemory.toggleFromName.GO.valueCached;
      if (agentMemory.fieldFromName.hasOwnProperty('WAKE'))
         {                                               // Check for a number so that we can disable
         wake = agentMemory.fieldFromName.WAKE;          // automatic wake-up using 'SNOOZE'
         var shouldWake = Util_isNumber(wake.valueCached) && wake.valueCached < Util_utsNowGet();
         console.log(
                ePlatycoreAgentKey + ': wake.valueCached = ' + Util_StringFromTimestamp(wake.valueCached) + '\n'
               +ePlatycoreAgentKey + ': utsNow           = ' + Util_StringFromTimestamp(Util_utsNowGet())
               );
         }
      else
         {
         wake = null;
         var shouldWake = false;
         }
      console.log('agent ' + ePlatycoreAgentKey + ': ' + (isIdle?(shouldWake?'WAKE':'IDLE'):'UPDATE'));
      if (!isIdle || shouldWake)
         {
         areAnyAgentsActive = true;
         try{
            var agent = new Agent(sheet, {
                  memory: agentMemory,
                  origin:'triggerBlockPump',
                  utsSheetLastUpdated: utsLastUpdated
                  });
            agentMemory = null; // no longer valid
            wake = null;        // no longer valid
            if (agent.TurnOn())
               {
               try{
                  agent.Log('turned on at ' + Util_wallTimeFromTimestamp(Util_utsNowGet()));
                  agent.Step();
                  }
               catch (e)
                  {
                  agent.Error(ePlatycoreAgentKey + ': Step', e, e.stack);
                  }
               finally
                  {
                  var dtRuntime = Util_utsNowGet() - utsIterationStarted;
                  if (dtRuntime > dtSingleBlockRuntimeWarningThreshold)
                     {
                     agent.Warn('agent is starting to run for a long time');
                     }
                  else if (dtRuntime > dtSingleBlockRuntimeLimit)
                     {
                     agent.Error('agent is running for too long!');
                     }
                  else
                     {
                     agent.Log('turned  off after ' + Util_stopwatchStringFromDuration(dtRuntime) + ' at ' + Util_wallTimeFromTimestamp(Util_utsNowGet()));
                     }
                  agent.TurnOff();
                  }
               }
            } // try - running the agent through a cycle
         catch (e)
            {
            console.error(e, e.stack);
            throw e;
            }
         } // is GO or wake
   
      if (isSingleBlock)
         {
         break;
         }

      }
      
   //
   // update the save
   //

   var documentLock = LockService.getDocumentLock();
   if (documentLock.tryLock(dtSingleBlockRuntimeLimit/4))
      {
      try{

         //
         // Sync the platycore object in document memory
         //

         var savedPlatycore = JSON.parse(properties.getProperty('platycore') || '{}');
         savedPlatycore.utsLastSaved = Util_utsNowGet();
         (function (unsavedKeys) {
            if (unsavedKeys.length > 0)
               {
               console.warn('Possibly unsaved key(s) in platycore config: ', unsavedKeys);
               }
            })(Object.keys(platycore).filter(function (e) { return !savedPlatycore.hasOwnProperty(e) }));
         properties.setProperty('platycore', JSON.stringify(savedPlatycore));
         platycore = savedPlatycore;

         }
      finally
         {
         documentLock.releaseLock();
         savedPlatycore = null;
         }
      }
   }

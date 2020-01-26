
// this is cleanup code that should go into a helper function of some sort that gets run occasionally

      // Remove agent keys for agents that don't exist anymore
      // properties_.getKeys()
      //       .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' })
      //       .map(function (e) { return e.substring(14) })
      //       .filter(function (e) { return !platycore.agentBootSectorFromSheetId.hasOwnProperty(e) })
      //       .forEach(function (e)
      //          {
      //          console.log('removing unused platycore agent key ' + e);
      //          properties_.deleteProperty(e);
      //          });

function triggerBlockPump ()
   {
   doBlockPump();
   }

var doBlockPump = function () {

   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var file_ = DriveApp.getFileById(spreadsheet_.getId());
   var properties_ = PropertiesService.getDocumentProperties();
   var utsExecutionCutoffTime_ = Util_utsNowGet() + 1000 * 60 * 5 - dtSingleBlockRuntimeLimit;
   var dtSingleBlockRuntimeLimit_ = 60/*seconds*/ * 1000; // print an error if any agent executes longer than this time
   var dtSingleBlockRuntimeWarningThreshold_ = 0.70/*percent*/ * dtSingleBlockRuntimeLimit; // print a warning if the agent runs longer than this time
   var sheets_ = spreadsheet.getSheets();
   var nSheetCount_ = sheets_.length;
   var iSheet_ = 0;

   doBlockPump = function ()
      {

      //
      // Recover from errors in previous executions
      //

      try
         {
         var platycore = JSON.parse(properties_.getProperty('platycore'));
         var lastPumpKey = properties_.getProperty('platycoreLastPumpKey');
         if (lastPumpKey !== platycore.pumpKey)
            {
            // Something went wrong during the last execution
            // and platycore died. In the future, run a
            // careful recovery. For now, nuke it and start
            // over.
            throw 'platycore is broken'
            }
         platycore.pumpKey = Utilities.getUuid();
         properties_.setProperty('platycoreLastPumpKey', platycore.pumpKey);
         }
      catch (e)
         {
         var platycore = {
               utsLastSaved: 0,
               agentBootSectorFromSheetId: {}
               };
         }

      var utsLastSaved = platycore.utsLastSaved;
      var utsLastUpdated = file_.getLastUpdated().getTime();
      var utsIterationStarted = Util_utsNowGet();

      if (utsLastSaved < utsLastUpdated)
         {
         sheets_ = spreadsheet.getSheets();
         iSheet_ = 0;
         }

      if (iSheet_ >= nSheetCount_)
         {
         iSheet_ = 0;
         }
      
      if (iSheet_ < nSheetCount_)
         {

         //
         // Load the sheet and its boot sector
         //
         var sheet = sheets[iSheet_];
         iSheet_ = (iSheet_ + 1 ) % nSheetCount_;
         var sheetId = sheet.getSheetId();
         var bootSector = platycore.agentBootSectorFromSheetId[sheetId];
         var agentMemory = properties.getProperty('platycoreAgent'+sheetId);
         }
      else
         {
         var sheet = null;
         var sheetId = null;
         var bootSector = null;
         var agentMemory = null;
         }

      if (null !== agentMemory)
         {
         agentMemory = JSON.parse(agentMemory);
         if (!Util_isObject(bootSector))
            {
            var agent = new Agent(sheet, {memory: agentMemory, origin:'doBlockPump - bootSector recovery'});
            bootSector = agent.BootSectorGet();
            }
         else
            {
            var agent = null;
            }
         platycore.agentBootSectorFromSheetId = bootSector;

         //
         // Update the boot sector's values if we are out of date
         //
         var isCacheExpired = utsLastSaved < utsLastUpdated;
         if (Util_isObject(bootSector.EN))
            {
            bootSector.EN.value = Util_boolCast (
                  isCacheExpired ? sheet.getRange(bootSector.EN.r, bootSector.EN.c).getValue() : bootSector.EN.value
                  );
            }
         if (Util_isObject(bootSector.WAKE))
            {
            bootSector.WAKE.value = Util_intCast (
                  isCacheExpired ? sheet.getRange(bootSector.WAKE.r, bootSector.WAKE.c).getValue() : bootSector.WAKE.value
                  );
            }
         if (Util_isObject(bootSector.GO))
            {
            bootSector.GO.value = Util_boolCast (
                  isCacheExpired ? sheet.getRange(bootSector.GO.r, bootSector.GO.c).getValue() : bootSector.GO.value
                  );
            }
         
         var isEnabled = !Util_isObject(bootSector.EN) || bootSector.EN.value;
         var isGo = Util_isObject(bootSector.GO) && bootSector.GO.value;
         var isWake = Util_isObject(bootSector.WAKE) && utsIterationStarted > bootSector.WAKE.value;

         }
      else
         {
         var agent = null;
         var isCacheExpired = false;
         var isEnabled = false;
         var isGo = false;
         var isWake = false;
         }

      if (isEnabled && (isGo || isWake))
         {
         if (!Util_isObject(agent))
            {
            agent = new Agent(sheet, {sheet: sheet, sheetId: sheetId, memory: agentMemory, origin:'doBlockPump - step'});
            }
         agentMemory = null; // no longer valid
         try
            {
            if (agent.TurnOn())
               {
               try{
                  agent.Log('turned on at ' + Util_wallTimeFromTimestamp(Util_utsNowGet()));
                  agent.Step();
                  }
               catch (e)
                  {
                  agent.Error('Step', e, e.stack);
                  }
               finally
                  {
                  var dtRuntime = Util_utsNowGet() - utsIterationStarted;
                  agent.Log('turned  off after ' + Util_stopwatchStringFromDuration(dtRuntime) + ' at ' + Util_wallTimeFromTimestamp(Util_utsNowGet()));
                  if (dtRuntime > dtSingleBlockRuntimeLimit_)
                     {
                     agent.Error('agent is running for too long!');
                     }
                  else if (dtRuntime > dtSingleBlockRuntimeWarningThreshold_)
                     {
                     agent.Warn('agent is starting to run for a long time');
                     }
                  agent.TurnOff();
                  }
               }
            } // try - running the agent through a cycle
         catch (e)
            {
            agent.Error('TurnOn/TurnOff', e, e.stack);
            }
         }

      //
      // Update the save
      //

      var documentLock = LockService.getDocumentLock();
      if (documentLock.tryLock(dtSingleBlockRuntimeLimit/4))
         {
         try{
            if (properties_.getProperty('platycoreLastPumpKey') === platycore.pumpKey)
               {
               platycore.utsLastSaved = Util_utsNowGet();
               properties.setProperty('platycore', JSON.stringify(platycore));
               }
            }
         finally
            {
            documentLock.releaseLock();
            }
         }

      return Util_utsNowGet() < utsExecutionCutoffTime_;

      };

   return doBlockPump();
};

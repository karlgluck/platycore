

function triggerBlockPump ()
   {
   doBlockPump();
   }

var doBlockPump = function () {

   var spreadsheet_ = SpreadsheetApp.getActiveSpreadsheet();
   var file_ = DriveApp.getFileById(spreadsheet_.getId());
   var properties_ = PropertiesService.getDocumentProperties();
   var dtSingleBlockRuntimeLimit_ = 60/*seconds*/ * 1000; // print an error if any agent executes longer than this time
   var utsExecutionCutoffTime_ = Lang.GetTimestampNow() + 1000 * 60 * 5 - dtSingleBlockRuntimeLimit_;
   var dtSingleBlockRuntimeWarningThreshold_ = 0.70/*percent*/ * dtSingleBlockRuntimeLimit_; // print a warning if the agent runs longer than this time
   var sheets_ = spreadsheet_.getSheets();
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
         }
      catch (e)
         {
         var platycore = {
               utsLastSaved: 0,
               agentBootSectorFromSheetId: {}
               };
         }
      platycore.pumpKey = Utilities.getUuid();
      properties_.setProperty('platycoreLastPumpKey', platycore.pumpKey);

      var utsLastSaved = platycore.utsLastSaved;
      var utsLastUpdated = file_.getLastUpdated().getTime();
      var utsIterationStarted = Lang.GetTimestampNow();

      if (utsLastSaved < utsLastUpdated)
         {
         sheets_ = spreadsheet_.getSheets();
         iSheet_ = 0;
         }

      if (iSheet_ >= nSheetCount_)
         {
         iSheet_ = 0;
         }
      
      var qSheetsLeftToSearch = nSheetCount_;
      while (--qSheetsLeftToSearch >= 0)
         {

         //
         // Load the sheet and its boot sector
         //
         console.log('iSheet_', iSheet_);
         console.log('nSheetCount_', nSheetCount_);
         if (iSheet_ < nSheetCount_)
            {
            var sheet = sheets_[iSheet_];
            iSheet_ = (iSheet_ + 1 ) % nSheetCount_;
            var sheetId = sheet.getSheetId();
            var bootSector = platycore.agentBootSectorFromSheetId[sheetId];
            var agentMemory = properties_.getProperty('platycoreAgent'+sheetId);
            }
         else
            {
            qSheetsLeftToSearch = 0;
            var sheet = null;
            var sheetId = null;
            var bootSector = null;
            var agentMemory = null;
            }

         console.log('sheetId', sheetId);
         console.log('bootSector', bootSector);
         console.log('agentMemory', agentMemory);
         if (null !== agentMemory)
            {
            agentMemory = JSON.parse(agentMemory);
            if (!Lang.IsObject(bootSector))
               {
               var agent = new Agent(sheet, {memory: agentMemory, origin: 'doBlockPump - bootSector recovery'});
               bootSector = agent.BootSectorGet();
               }
            else
               {
               var agent = null;
               }
            platycore.agentBootSectorFromSheetId[sheetId] = bootSector;

            //
            // Update the boot sector's values if we are out of date
            //
            var isCacheExpired = utsLastSaved < utsLastUpdated;
            if (isCacheExpired)
               {
               delete bootSector.valueFromPropertyName.EN;
               delete bootSector.valueFromPropertyName.WAKE;
               delete bootSector.valueFromPropertyName.GO;
               }
            if (bootSector.rangeNameFromPropertyName.hasOwnProperty('EN'))
               {
               var range = spreadsheet_.getRangeByName(bootSector.rangeNameFromPropertyName.EN);
               if (Lang.IsObject(range))
                  {
                  bootSector.valueFromPropertyName.EN = Lang.boolCast(range.getValue());
                  }
               else
                  {
                  delete bootSector.rangeNameFromPropertyName.EN;
                  }
               }
            if (bootSector.rangeNameFromPropertyName.hasOwnProperty('WAKE'))
               {
               var range = spreadsheet_.getRangeByName(bootSector.rangeNameFromPropertyName.WAKE);
               if (Lang.IsObject(range))
                  {
                  bootSector.valueFromPropertyName.EN = Lang.intCast(range.getValue());
                  }
               else
                  {
                  delete bootSector.rangeNameFromPropertyName.WAKE;
                  }
               }
            if (bootSector.rangeNameFromPropertyName.hasOwnProperty('GO'))
               {
               var range = spreadsheet_.getRangeByName(bootSector.rangeNameFromPropertyName.GO);
               if (Lang.IsObject(range))
                  {
                  bootSector.valueFromPropertyName.EN = Lang.boolCast(range.getValue());
                  }
               else
                  {
                  delete bootSector.rangeNameFromPropertyName.GO;
                  }
               }
            
            var isEnabled = !bootSector.rangeNameFromPropertyName.hasOwnProperty('EN') || Lang.boolCast(bootSector.valueFromPropertyName.EN);
            var isGo = bootSector.rangeNameFromPropertyName.hasOwnProperty('GO') && bootSector.valueFromPropertyName.GO;
            var isWake = bootSector.rangeNameFromPropertyName.hasOwnProperty('WAKE') && utsIterationStarted > bootSector.valueFromPropertyName.WAKE;

            }
         else
            {
            var agent = null;
            var isCacheExpired = false;
            var isEnabled = false;
            var isGo = false;
            var isWake = false;
            }

         console.log('isEnabled', isEnabled);
         console.log('isGo', isGo);
         console.log('isWake', isWake);
         if (isEnabled && (isGo || isWake))
            {
            qSheetsLeftToSearch = 0;
            if (!Lang.IsObject(agent))
               {
               agent = new Agent(sheet, {sheetId: sheetId, memory: agentMemory, origin:'doBlockPump - step'});
               }
            agentMemory = null; // no longer valid
            try
               {
               if (agent.TurnOn())
                  {
                  try{
                     agent.Log('turned on at ' + Lang.GetWallTimeFromTimestamp(Lang.GetTimestampNow()));
                     agent.Step();
                     }
                  catch (e)
                     {
                     agent.Error('Step', e, e.stack);
                     }
                  finally
                     {
                     var dtRuntime = Lang.GetTimestampNow() - utsIterationStarted;
                     agent.Log('turned off after ' + Lang.stopwatchStringFromDuration(dtRuntime) + ' at ' + Lang.GetWallTimeFromTimestamp(Lang.GetTimestampNow()));
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

         } // while - look through every sheet once until one can be run, or none are runnable

      //
      // Update the save
      //

      var documentLock = LockService.getDocumentLock();
      if (documentLock.tryLock(dtSingleBlockRuntimeLimit_/4))
         {
         try{
            if (properties_.getProperty('platycoreLastPumpKey') === platycore.pumpKey)
               {
               platycore.utsLastSaved = Lang.GetTimestampNow();
               properties_.setProperty('platycore', JSON.stringify(platycore));
               }
            }
         finally
            {
            documentLock.releaseLock();
            }
         }

      return Lang.GetTimestampNow() < utsExecutionCutoffTime_;

      };

   return doBlockPump();
};

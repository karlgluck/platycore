

function triggerBlockPump ()
   {
   doBlockPump(); // TODO: run multiple times while there is stuff to do
   }

var doBlockPump = function () {

   var spreadsheet_ = SpreadsheetApp.getActiveSpreadsheet();
   var file_ = DriveApp.getFileById(spreadsheet_.getId());
   var utsExecutionCutoffTime_ = Lang.GetTimestampNow() + Platycore.PumpRuntimeLimit - Platycore.BlockRuntimeLimit;
   var sheets_ = spreadsheet_.getSheets();
   var nSheetCount_ = sheets_.length;
   var iSheet_ = -1;
   var utsLastSync = Lang.GetTimestampNow();

   doBlockPump = function ()
      {

      //
      // Recover from errors in previous executions
      //

      var utsLastUpdated = file_.getLastUpdated().getTime();
      var utsIterationStarted = Lang.GetTimestampNow();

      if (utsLastSync < utsLastUpdated)
         {
         utsLastSync = utsLastUpdated;
         sheets_ = spreadsheet_.getSheets();
         iSheet_ = -1;
         }

      if (iSheet_ >= nSheetCount_)
         {
         iSheet_ = 0;
         }
      
      var qSheetsLeftToSearch = nSheetCount_;
      while (--qSheetsLeftToSearch >= 0)
         {

         iSheet_ = (iSheet_ + 1 ) % nSheetCount_;
         var sheet = sheets_[iSheet_];
         var agent = new Agent(sheet);

         var isEnabled = false;
         var isGo = false;
         var isWake = false;
         
         if (agent.Preboot())
            {
            isEnabled = (function (en) { return Lang.IsUndefined(en) || Lang.boolCast(en) })(agent.ReadToggle('EN'));
            isGo = (function (go) { return !Lang.IsUndefined(go) && Lang.boolCast(go) })(agent.ReadToggle('GO'));
            isWake = (function (wake) { return Lang.IsNumber(wake) && utsIterationStarted > wake })(agent.ReadField('WAKE'));
            }

         if (isEnabled && (isGo || isWake))
            {
            qSheetsLeftToSearch = 0;
            agent = new Agent(sheet);            
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
                     if (dtRuntime > Platycore.BlockRuntimeLimit)
                        {
                        agent.Error('agent is running for too long!');
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
      // Look through the channels and propagate changes
      //

      // var channelsTable = GAS.GetTableFromSheetP(spreadsheet_.getSheetByName('channels'));
      // var icLastUpdated = 1 + channelsTable[0].indexOf('last_updated');
      // var relationships = Lang.MakeRelationshipsUsingTable(channelsTable);
      // relationships.forEach(function (eRelationship)
      //    {
      //    var utsLastUpdated = DriveApp.getFileById(eRelationship.drive_file_url.match(/[-\w]{25,}/)).getLastUpdated().getTime();
      //    var utsLastTriggered = new Date(eRelationship.last_updated).getTime();
      //    if (utsLastUpdated != utsLastTriggered)
      //       {
      //       eRelationship.agents.forEach(function (eAgentName)
      //          {
      //          var goRange = spreadsheet_.getRangeByName('GO_' + eAgentName);
      //          if (Lang.IsObject(goRange))
      //             {
      //             console.log(eRelationship.drive_file_url + ' triggered ' + eAgentName);
      //             goRange.setFormula("=TRUE");
      //             }
      //          });
      //       }
      //    });

      return Lang.GetTimestampNow() < utsExecutionCutoffTime_;

      };

   return doBlockPump();
};

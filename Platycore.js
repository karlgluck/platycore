var Platycore = (function (ns) {

ns.Version = '2009.2';
ns.IsInteractive = true;

//------------------------------------------------------------------------------------------------------------------------------------
//
// Add default values to Platycore global parameters that
// can be edited in the Script properties tab of the
// Project properties window on the web.

var scriptProperties = PropertiesService.getScriptProperties();
var configFromSettingName = {
      'DocumentTryLockWaitTime': { cast: Lang.MakeIntUsingAnyP, defaultValue: 15000 },
      'IsVerbose': { cast: Lang.MakeBoolUsingAnyP, defaultValue: true },
      'BlockRuntimeLimit': { cast: Lang.MakeIntUsingAnyP, defaultValue: 60000 },
      'PumpRuntimeLimit': { cast: Lang.MakeIntUsingAnyP, defaultValue: 300000 },
      'MaximumAgentLogRows': { cast: Lang.MakeIntUsingAnyP, defaultValue: 99 },
      };
Object.keys(configFromSettingName).forEach(function (eSettingName) {
   var config = configFromSettingName[eSettingName];
   var value = scriptProperties.getProperty(eSettingName);
   if (Lang.IsNotMeaningfulP(value))
      {
      value = Lang.MakeStringUsingAnyP(config.defaultValue);
      scriptProperties.setProperty(eSettingName, value);
      }
   ns[eSettingName] = config.cast(value);
   });

//------------------------------------------------------------------------------------------------------------------------------------
//

ns.UpdateDriveFileTriggers = function ()
   {
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

   //
   // Ensure the input sheet is in the correct format
   //

   var sheet = spreadsheet.getSheetByName('drive_file_triggers');
   if (Lang.IsNotObjectP(sheet))
      {
      sheet = spreadsheet.insertSheet('drive_file_triggers', 0);
      }

   (function (qcMissingCols)
      {
      if (qcMissingCols > 0)
         {
         sheet.insertRowsAfter(sheet.getMaxRows(), qcMissingCols);
         }
      })(2 - sheet.getMaxColumns());


   sheet.setFrozenRows(1);
   sheet.getRange(1, 1, 1, 1).setValue('last_updated');
   sheet.getRange(1, 2, 1, 1)
         .setValue('drive_file_url | agents')
         .setTextRotation(45)
         .setVerticalAlignment('middle')
         .setHorizontalAlignment('center');
   sheet.setRowHeight(1, 175);
   sheet.setColumnWidth(2, 300);
   GAS.TrimSheetRows(sheet);

   //
   // Synchronize the list of agents
   //
   
   var icLastColumn = sheet.getLastColumn();
   var sheets = spreadsheet.getSheets();

   var sheetAgentIds = icLastColumn > 2 ? sheet.getRange(1,3, 1, icLastColumn - 2).getDisplayValues()[0] : [];
   var existingAgentIds = sheets.map(eSheet => new AgentConnection(eSheet)).filter(eAgent => eAgent.IsConnected()).map(eAgent => eAgent.GetAgentId());
   var deadAgents = sheetAgentIds.filter(e => Lang.IsNotContainedInArrayP(e, existingAgentIds));
   if (deadAgents.length > 0)
      {
      deadAgents.map(eAgentId => sheetAgentIds.indexOf(eAgentId) + 3)
            .reverse()
            .forEach(eicColumn => sheet.deleteColumn(eicColumn));
      }
   var newAgents = existingAgentIds.filter(e => Lang.IsNotContainedInArrayP(e, sheetAgentIds));
   if (newAgents.length > 0)
      {
      sheet.insertColumnsAfter(2, newAgents.length);
      var spreadsheetUrlPrefix = spreadsheet.getUrl() + '#gid=';
      var newAgentFormulas = newAgents.map(eAgentId => '=HYPERLINK("' + spreadsheetUrlPrefix + eAgentId.slice(1) + '", "' + eAgentId + '")');
      sheet.getRange(1, 3, 1, newAgentFormulas.length).setFormulas([newAgentFormulas]).setTextRotation(90).setVerticalAlignment('bottom');
      sheet.setColumnWidths(3, newAgentFormulas.length, sheet.getRowHeight(2));
      var irLastRow = sheet.getLastRow();
      if (irLastRow > 1)
         {
         sheet.getRange(2, 3, irLastRow - 1, newAgents.length).insertCheckboxes();
         }
      }
   
   //
   // Update formatting
   //

   (function (qrDataRows, qcAgentCheckboxes)
      {
      if (qrDataRows > 0)
         {
         sheet.getRange(2, 1, qrDataRows, 1).setNumberFormat('M/d/yyyy H:mm:ss');
         sheet.setRowHeights(2, qrDataRows, 21);
         if (qcAgentCheckboxes > 0)
            {
            sheet.setColumnWidths(3, qcAgentCheckboxes, 21);
            sheet.getRange(2, 3, qrDataRows, qcAgentCheckboxes).insertCheckboxes();
            }
         }
      })(sheet.getMaxRows() - 1, sheet.getMaxColumns() - 2);

   //
   // Set the GO flags for agents whose input channels changed
   //

   var channelsTable = GAS.MakeTableUsingSheetP(sheet);
   var relationships = Lang.MakeRelationshipsUsingTable(channelsTable);
   if (relationships.length > 0)
      {
      var lastUpdatedRange = sheet.getRange(2, 1 + channelsTable[0].indexOf('last_updated'), relationships.length, 1);
      var lastUpdatedValues = lastUpdatedRange.getValues();
      relationships.forEach(function (eRelationship, iRelationship)
         {
         var id = eRelationship.drive_file_url.match(/[-\w]{25,}/);
         if (Lang.IsNotArrayP(id)) return;
         var file = DriveApp.getFileById(id[0]);
         if (Lang.IsNotObjectP(file)) return;
         var lastUpdatedDate = file.getLastUpdated();
         var utsLastUpdated = lastUpdatedDate.getTime();
         var utsLastTriggered = new Date(eRelationship.last_updated).getTime();
         if (utsLastUpdated != utsLastTriggered)
            {
            lastUpdatedValues[iRelationship][0] = lastUpdatedDate;
            eRelationship.agents.forEach(function (eAgentId)
               {
               var goRange = spreadsheet.getRangeByName(eAgentId + '_GO');
               if (Lang.IsObjectP(goRange))
                  {
                  console.log(eRelationship.drive_file_url + ' triggered ' + eAgentId);
                  goRange.setValue(true);
                  }
               });
            }
         });
      lastUpdatedRange.setValues(lastUpdatedValues);
      }

   };


//------------------------------------------------------------------------------------------------------------------------------------
//

ns.MainLoop = function ()
   {

   var spreadsheet_ = SpreadsheetApp.getActiveSpreadsheet();
   var file_ = DriveApp.getFileById(spreadsheet_.getId());
   var utsExecutionCutoffTime_ = Lang.GetTimestampNowP() + Platycore.PumpRuntimeLimit - Platycore.BlockRuntimeLimit;
   var sheets_ = spreadsheet_.getSheets();
   var nSheetCount_ = sheets_.length;
   var iSheet_ = -1;
   var utsLastSync = Lang.GetTimestampNowP();

   ns.MainLoop = function ()
      {

      //
      // Recover from errors in previous executions
      //

      var utsLastUpdated = file_.getLastUpdated().getTime();
      var utsIterationStarted = Lang.GetTimestampNowP();

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
         var agent = new AgentConnection(sheet);
         
         if (agent.IsConnected())
            {
            qSheetsLeftToSearch = 0;
            /*var executionDetails = */agent.ExecuteRoutineUsingA1Note();
            var dtRuntime = Lang.GetTimestampNowP() - utsIterationStarted;
            if (dtRuntime > Platycore.BlockRuntimeLimit)
               {
               agent.Error('agent is running for too long!');
               }
            }

         } // while - look through every sheet once until one can be run, or none are runnable


      return Lang.GetTimestampNowP() < utsExecutionCutoffTime_;

      };

   return ns.MainLoop();
   };



//------------------------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------------------------------------------

return ns;

})(Platycore || {});
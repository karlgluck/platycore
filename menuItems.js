function menuUpdateDriveFileTriggers()
   {
   updateDriveFileTriggers();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuClearAgentOutput ()
   {
   platycoreVerifyPermissions();
   var sheet = SpreadsheetApp.getActiveSheet();
   var qrFrozenRows = sheet.getFrozenRows();
   var mrMaxRows = sheet.getMaxRows();
   var irFirstUnfrozenRow = qrFrozenRows + 1;
   var irFirstRowToDelete = irFirstUnfrozenRow + 1;
   sheet.insertRowsBefore(irFirstUnfrozenRow, 1);
   sheet.deleteRows(irFirstRowToDelete, mrMaxRows - irFirstRowToDelete + 2);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuNewAgent()
   {
   platycoreVerifyPermissions();

   var html = HtmlService.createHtmlOutputFromFile('newAgentSidebar.html')
      .setTitle('New Agent')
      .setWidth(300);
   SpreadsheetApp.getUi().showSidebar(html);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuReinstallAgent()
   {
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet());
      var kAgentId = agent.GetAgentId();
      agent.Uninstall();
      newAgent(urlAgentInstructions, kAgentId);
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast('Reinstall failed: ' + e + ' ' + e.stack);
      console.log('Reinstall failed: ' + e + ' ' + e.stack, e.stack);
      throw e;
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuRunSelectedNote ()
   {
   platycoreVerifyPermissions();
   try
      {
      var cellRange = SpreadsheetApp.getCurrentCell();
      var agent = new Agent(cellRange.getSheet());
      try
         {
         if (agent.Preboot() && agent.TurnOn())
            {
            var noteName = agent.FindNameUsingRangeP(cellRange);
            if (null !== noteName)
               {
               agent.ExecuteRoutineByName(noteName);
               }
            else
               {
               var routine = cellRange.getNote();
               var cellRangeA1Notation = cellRange.getA1Notation();
               agent.Warn(cellRangeA1Notation + ' is not a named NOTE known to the Agent; executing directly:', routine);
               agent.ExecuteRoutineFromText(routine);
               }
            }
         }
      catch (e)
         {
         agent.Error('Run selected note', e, e.stack);
         }
      finally
         {
         agent.TurnOff();
         }
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuRunSentinel ()
   {
   platycoreVerifyPermissions();
   try
      {
      GAS.DeleteTriggerByName('triggerBlockPump');
      ScriptApp.newTrigger('triggerBlockPump').timeBased().everyMinutes(5).create();
      SpreadsheetApp.getActiveSpreadsheet().toast('There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuShowAgentSidebar()
   {
   platycoreVerifyPermissions();

   var html = HtmlService.createHtmlOutputFromFile('agentSidebar.html')
      .setTitle('Agent Sidebar')
      .setWidth(300);
   SpreadsheetApp.getUi().showSidebar(html);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuStepAgent()
   {
   platycoreVerifyPermissions();
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet());
      if (agent.Preboot())
         {
         try
            {
            if (agent.TurnOn())
               {
               agent.Step();
               }
            }
         catch (e)
            {
            agent.Error('Step', e, e.stack);
            }
         finally
            {
            agent.TurnOff();
            }
         }
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuStepBlockPump()
   {
   platycoreVerifyPermissions();
   doBlockPump(true);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuStopSentinel ()
   {
   platycoreVerifyPermissions();
   GAS.DeleteTriggerByName('triggerBlockPump');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuUninstallAgent()
   {
   platycoreVerifyPermissions();
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet());
      agent.Uninstall();
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuCollectGarbage()
   {

   updateDriveFileTriggers();

   }

//------------------------------------------------------------------------------------------------------------------------------------

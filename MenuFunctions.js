
function onOpen()
   {
   var ui = SpreadsheetApp.getUi();

   // 🧮 🗜️ 🖥️ 👾  🤖  ⚗️

   ui.createMenu('\u2800' + Lang.GetMoonPhaseFromDate(new Date()) + ' Platycore\u2800')
         .addItem('👾 New Agent...', 'menuNewAgent')
         .addSeparator()
         .addItem('🗑️ Uninstall Agent', 'menuUninstallAgent')
         .addToUi();

   ui.createMenu('\u2800▶️ Run\u2800')
         .addItem('📄 Note...', 'menuRunSelectedNote')
         .addItem('👾 Agent...', 'menuStepAgent')
         .addItem('▶️ Main Loop...', 'menuStepBlockPump')
         .addSeparator()
         .addItem('🔁 Start automation', 'menuRunSentinel')
         .addItem('⏸️ Stop automation', 'menuStopSentinel')
         .addToUi();

   ui.createMenu('\u2800🐞 Debug\u2800')
         .addItem('✨ Clear Output', 'menuClearAgentOutput')
         .addItem('🔄 Update Drive file triggers...', 'menuUpdateDriveFileTriggers')
         .addToUi();

   }
   
//------------------------------------------------------------------------------------------------------------------------------------

function menuUpdateDriveFileTriggers()
   {
   Platycore.UpdateDriveFileTriggers();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuClearAgentOutput ()
   {
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
   var html = HtmlService.createHtmlOutputFromFile('newAgentSidebar.html')
      .setTitle('New Agent')
      .setWidth(300);
   SpreadsheetApp.getUi().showSidebar(html);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuRunSelectedNote ()
   {
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

   var html = HtmlService.createHtmlOutputFromFile('agentSidebar.html')
      .setTitle('Agent Sidebar')
      .setWidth(300);
   SpreadsheetApp.getUi().showSidebar(html);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuStepAgent()
   {
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
   Platycore.UpdateDriveFileTriggers();
   Platycore.StepBlockPump();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuStopSentinel ()
   {
   GAS.DeleteTriggerByName('triggerBlockPump');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuUninstallAgent()
   {
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet());
      var ui = SpreadsheetApp.getUi();
      var button = ui.alert('Uninstall Agent', 'Are you sure you want to delete agent ' + agent.GetAgentId() + '(' + agent.GetName() + ')?', ui.ButtonSet.YES_NO);
      if (ui.Button.YES === button)
         {
         agent.Uninstall();
         }
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

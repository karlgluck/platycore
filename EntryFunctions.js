


//------------------------------------------------------------------------------------------------------------------------------------

function commandSidebarExecute(text)
   {
   var agent = new Agent(SpreadsheetApp.getActiveSheet());
   agent.ExecuteRoutineFromText(text);
   //Platycore.CreateAgent('data:application/x-gzip;base64,' + Lang.GetBase64GzipFromString(text));
   }

//------------------------------------------------------------------------------------------------------------------------------------

function triggerMainLoop ()
   {
   Platycore.IsInteractive = false;
   // TODO: run multiple times while there is stuff to do
   Platycore.UpdateDriveFileTriggers();
   Platycore.MainLoop();
   }


//------------------------------------------------------------------------------------------------------------------------------------

function onOpen()
   {
   var ui = SpreadsheetApp.getUi();

   // 🧮 🗜️ 🖥️ 👾  🤖  ⚗️ 🧚

   ui.createMenu('\u2800' + Lang.GetMoonPhaseFromDate(new Date()) + ' Platycore\u2800')
         .addItem('🧚 Install agent...', 'menuInstallAgent')
         .addSeparator()
         .addItem('💨 Uninstall this agent', 'menuUninstallAgent')
         .addToUi();

   ui.createMenu('\u2800▶️ Run\u2800')
         .addItem('📄 Note...', 'menuRunSelectedNote')
         .addItem('🧚 Agent...', 'menuStepAgent')
         .addItem('▶️ Main Loop...', 'menuMainLoop')
         .addSeparator()
         .addItem('🔁 Start automation', 'menuStartRunningMainLoop')
         .addItem('⏸️ Stop automation', 'menuStopRunningMainLoop')
         .addToUi();

   ui.createMenu('\u2800🐞 Debug\u2800')
         .addItem('✨ Clear output', 'menuClearAgentOutput')
         .addItem('🔄 Update Drive file triggers...', 'menuUpdateDriveFileTriggers')
         .addToUi();

   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuInstallAgent()
   {
   var html = HtmlService.createHtmlOutputFromFile('CommandSidebar.html')
      .setTitle('Platycore')
      .setWidth(300);
   SpreadsheetApp.getUi().showSidebar(html);
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

function menuStartRunningMainLoop ()
   {
   try
      {
      GAS.DeleteTriggerByName('triggerMainLoop');
      ScriptApp.newTrigger('triggerMainLoop').timeBased().everyMinutes(5).create();
      SpreadsheetApp.getActiveSpreadsheet().toast('There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
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

function menuMainLoop()
   {
   Platycore.UpdateDriveFileTriggers();
   Platycore.MainLoop();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuStopRunningMainLoop ()
   {
   GAS.DeleteTriggerByName('triggerMainLoop');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
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

function menuUpdateDriveFileTriggers()
   {
   Platycore.UpdateDriveFileTriggers();
   }



function DEBUGGY ()
   {
   GAS.ApplyRetentionPolicyToSheet({utsOldestDateToKeep: new Date().getTime() - (30 * 24 * 60 * 60 * 1000)}, SpreadsheetApp.getActiveSheet());
   }
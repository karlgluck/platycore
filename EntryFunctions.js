


//------------------------------------------------------------------------------------------------------------------------------------

function commandSidebarExecute(text)
   {
   Platycore.ConnectAndRun(SpreadsheetApp.getActiveSheet(), (c) => c.ExecuteRoutineUsingText(text));
   }
   

//------------------------------------------------------------------------------------------------------------------------------------

function triggerMainLoop ()
   {
   Platycore.IsInteractive = false;
   // TODO: run multiple times while there is stuff to do and we have time
   Platycore.UpdateDriveFileTriggers();
   Platycore.MainLoop();
   }


//------------------------------------------------------------------------------------------------------------------------------------

function onOpen()
   {
   var ui = SpreadsheetApp.getUi();

   // 🧮 🗜️ 🖥️ 👾  🤖  ⚗️ 🧚

   ui.createMenu('\u2800' + Lang.GetMoonPhaseFromDateP(new Date()) + ' Platycore\u2800')
         .addItem('🧚 Add empty agent...', 'menuAddEmptyAgent')
         .addSeparator()
         .addItem('💨 Uninstall this agent', 'menuUninstallAgent')
         .addToUi();

   ui.createMenu('\u2800▶️ Run\u2800')
         .addItem('📄 Note...', 'menuRunSelectedNote')
         .addItem('🧚 Agent...', 'menuStepAgent')
         .addItem('▶️ Main Loop...', 'menuMainLoop')
         .addSeparator()
         .addItem('📋 Open command sidebar', 'menuOpenCommandSidebar')
         .addSeparator()
         .addItem('🔁 Start automation', 'menuStartRunningMainLoop')
         .addItem('⏸️ Stop automation', 'menuStopRunningMainLoop')
         .addToUi();

   ui.createMenu('\u2800🐞 Debug\u2800')
         .addItem('✨ Clear output', 'menuClearAgentOutput')
         .addItem('🔓 Unlock Document (LockService)', 'menuUnlockDocumentLockService')
         .addSeparator()
         .addItem('🔄 Update Drive file triggers...', 'menuUpdateDriveFileTriggers')
         .addToUi();

   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuAddEmptyAgent()
   {
   var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
   sheet.getRange('A1').insertCheckboxes().check().setNote('Add agent instructions to this note\n  INFO "This agent is empty"');
   sheet.activate();
   Platycore.UpdateDriveFileTriggers();
   menuOpenCommandSidebar(); // almost always want to do this next
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuUninstallAgent()
   {
   Platycore.ConnectAndRun(
         SpreadsheetApp.getActiveSheet(),
         function (agentConnection)
            {
            var ui = SpreadsheetApp.getUi();
            var button = ui.alert('Uninstall Agent', 'Are you sure you want to delete agent ' + agentConnection.GetName() + '(' + agentConnection.GetAgentId() + ')?', ui.ButtonSet.YES_NO);
            if (ui.Button.YES === button)
               {
               agentConnection.Uninstall();
               }
            }
         );
   Platycore.UpdateDriveFileTriggers();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuRunSelectedNote ()
   {
   Platycore.ConnectAndRun(
         SpreadsheetApp.getActiveSheet(),
         function (agentConnection)
            {
            var range = SpreadsheetApp.getCurrentCell();
            agentConnection.Info('Running ' + range.getA1Notation() + ' ' + String(range.getValue()));
            var execution = agentConnection.ExecuteRoutineUsingText(range.getNote());
            if (execution.didAbort)
               {
               agentConnection.Error('Execution aborted!');
               }
            }
         );
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuStepAgent()
   {
   Platycore.ConnectAndRun(
         SpreadsheetApp.getActiveSheet(),
         function (agentConnection)
            {
            agentConnection.Info('Running ' + agentConnection.GetName());
            var execution = agentConnection.ExecuteRoutineUsingA1Note();
            if (execution.didAbort)
               {
               agentConnection.Error('Execution aborted!');
               }
            }
         );
   }
 
//------------------------------------------------------------------------------------------------------------------------------------

function menuMainLoop()
   {
   Platycore.UpdateDriveFileTriggers();
   Platycore.MainLoop();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuOpenCommandSidebar()
   {
   var html = HtmlService.createHtmlOutputFromFile('CommandSidebar.html')
      .setTitle('Platycore')
      .setWidth(500);
   SpreadsheetApp.getUi().showSidebar(html);
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

function menuStopRunningMainLoop ()
   {
   GAS.DeleteTriggerByName('triggerMainLoop');
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuClearAgentOutput ()
   {
   Platycore.ConnectAndRun(SpreadsheetApp.getActiveSheet(), (c) => c.ClearOutput());
   }
   
//------------------------------------------------------------------------------------------------------------------------------------

function menuUpdateDriveFileTriggers()
   {
   Platycore.UpdateDriveFileTriggers();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuUnlockDocumentLockService()
   {
   LockService.getDocumentLock().releaseLock();
   }




//------------------------------------------------------------------------------------------------------------------------------------

function commandSidebarExecute(text)
   {
   var agent = new AgentConnection();
   if (agent.ConnectUsingActiveSheet())
      {
      agent.ExecuteRoutineFromText(text);
      }
   else
      {
      SpreadsheetApp.toast('Unable to connect to an agent on this sheet. Try adding an empty agent.');
      }
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
         .addItem('🔄 Update Drive file triggers...', 'menuUpdateDriveFileTriggers')
         .addToUi();

   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuAddEmptyAgent()
   {
   var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
   sheet.getRange('A1').insertCheckboxes().check().setNote('Add agent instructions to this note\n  INFO "This agent is empty"');
   sheet.activate();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuOpenCommandSidebar()
   {
   var html = HtmlService.createHtmlOutputFromFile('CommandSidebar.html')
      .setTitle('Platycore')
      .setWidth(300);
   SpreadsheetApp.getUi().showSidebar(html);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuUninstallAgent()
   {
   var agentConnection = new AgentConnection();
   if (agentConnection.ConnectUsingActiveSheet())
      {
      var ui = SpreadsheetApp.getUi();
      var button = ui.alert('Uninstall Agent', 'Are you sure you want to delete agent ' + agent.GetName() + '(' + agent.GetAgentId() + ')?', ui.ButtonSet.YES_NO);
      if (ui.Button.YES === button)
         {
         agentConnection.Uninstall();
         }
      }
   else
      {
      SpreadsheetApp.getActiveSpreadsheet().toast('Unable to connect to an agent on this sheet. Try adding an empty agent.');
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuRunSelectedNote ()
   {
   var cellRange = SpreadsheetApp.getCurrentCell();
   var agentConnection = new AgentConnection(cellRange.getSheet());
   if (agentConnection.ConnectUsingActiveSheet())
      {
      agentConnection.Info('Running ' + cellRange.getA1Notation() + ' ' + String(cellRange.getValue()));
      var execution = agentConnection.ExecuteRoutineFromText(cellRange.getNote());
      if (execution.didAbort)
         {
         agentConnection.Error('didAbort');
         }
      }
   else
      {
      SpreadsheetApp.getActiveSpreadsheet().toast('Unable to connect to an agent on this sheet. Try adding an empty agent.');
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
      var agent = new AgentConnection(SpreadsheetApp.getActiveSheet());
      if (agent.IsConnected())
         {
         if (agent.TurnOn())
            {
            agent.Step();
            }
         agent.TurnOff();
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

//------------------------------------------------------------------------------------------------------------------------------------

function commandSidebarExecute(text)
   {
   Platycore.ConnectAndRun(SpreadsheetApp.getActiveSheet(), (c) => c.ExecuteRoutineUsingText(text));
   }

//------------------------------------------------------------------------------------------------------------------------------------

function doGet (e)
   {
   var params = JSON.stringify(e);
   return HtmlService.createHtmlOutput(params);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function doPost (e)
   {
   return null;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function triggerMainLoop ()
   {

   Platycore.IsInteractive = false;

   var continueExecuting = true;
   while (continueExecuting)
      {
      Platycore.UpdateDriveFileTriggers();
      continueExecuting = Platycore.MainLoop();
      }

   }


//------------------------------------------------------------------------------------------------------------------------------------

function getAgentList()
   {
   // Hardcoded list of agents to avoid GitHub API rate limits
   var baseUrl = 'https://raw.githubusercontent.com/karlgluck/platycore/master/agents/';

   return [
      { name: 'AddSchedulingReminder', url: baseUrl + 'AddSchedulingReminder.txt' },
      { name: 'FrameworkTest', url: baseUrl + 'FrameworkTest.txt' },
      { name: 'GmailLabelSync', url: baseUrl + 'GmailLabelSync.txt' },
      { name: 'Labels2Lists', url: baseUrl + 'Labels2Lists.txt' },
      { name: 'ListDriveFoldersRecursively', url: baseUrl + 'ListDriveFoldersRecursively.txt' },
      { name: 'MakeDailyNotes', url: baseUrl + 'MakeDailyNotes.txt' },
      { name: 'TreehouseNews', url: baseUrl + 'TreehouseNews.txt' }
   ];
   }

//------------------------------------------------------------------------------------------------------------------------------------

function onOpen()
   {
   var ui = SpreadsheetApp.getUi();

   // 🧮 🗜️ 🖥️ 👾  🤖  ⚗️ 🧚

   // Get hardcoded agent list and create submenu
   var agents = getAgentList();
   var agentSubMenu = ui.createMenu('🧚 Add Agent')
         .addItem('Empty agent...', 'menuAddEmptyAgent');

   if (agents.length > 0)
      {
      agentSubMenu.addSeparator();

      // Store agent list in document properties for menu handlers to access
      PropertiesService.getDocumentProperties().setProperty('AGENT_LIST', JSON.stringify(agents));

      // Add menu item for each agent
      for (var i = 0; i < agents.length; i++)
         {
         agentSubMenu.addItem(agents[i].name, 'menuInstallAgent' + i);
         }
      }

   ui.createMenu('\u2800' + Lang.GetMoonPhaseFromDateP(new Date()) + ' Platycore\u2800')
         .addSubMenu(agentSubMenu)
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
         //.addSubMenu(ui.createMenu('Force'))
         //.addSeparator()
         .addItem('✨ Force Off', 'menuForceAgentOff')
         .addSubMenu(ui.createMenu('💤 Snooze Agent')
               .addItem('For 5 minutes','menuSnoozeAgentFor5Minutes')
               .addItem('Forever (disable wake timer)','menuSnoozeAgentForever')
               )
         .addItem('✨ Clear output', 'menuClearAgentOutput')
         //.addSeparator()
         .addItem('🔓 Unlock Document (LockService)', 'menuUnlockDocumentLockService')
         .addSeparator()
         .addItem('🔄 Update Drive file triggers...', 'menuUpdateDriveFileTriggers')
         .addToUi();

   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuForceAgentOff()
   {
   Platycore.ConnectAndRun(
         SpreadsheetApp.getActiveSheet(),
         function (agentConnection)
            {
            agentConnection.WriteCheckbox('ON', false);
            }
         );
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuSnoozeAgentFor5Minutes()
   {
   Platycore.ConnectAndRun(
         SpreadsheetApp.getActiveSheet(),
         function (agentConnection)
            {
            agentConnection.Snooze(5 * 60 * 1000);
            }
         );
   }

//------------------------------------------------------------------------------------------------------------------------------------

function menuSnoozeAgentForever()
   {
   Platycore.ConnectAndRun(
         SpreadsheetApp.getActiveSheet(),
         function (agentConnection)
            {
            agentConnection.SnoozeForever();
            }
         );
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

//------------------------------------------------------------------------------------------------------------------------------------

function menuInstallAgentByIndex(index)
   {
   var agentListJson = PropertiesService.getDocumentProperties().getProperty('AGENT_LIST');
   if (!agentListJson)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast('Agent list not found. Please reopen the spreadsheet to refresh the agent list.');
      return;
      }

   var agents = JSON.parse(agentListJson);
   if (index >= agents.length)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast('Invalid agent index: ' + index);
      return;
      }

   var agent = agents[index];
   var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
   sheet.getRange('A1').insertCheckboxes().check().setNote('  INSTALL "' + agent.url + '"');
   sheet.activate();
   Platycore.UpdateDriveFileTriggers();
   menuOpenCommandSidebar();
   }

//------------------------------------------------------------------------------------------------------------------------------------
// Pre-generated menu handlers for agents
//------------------------------------------------------------------------------------------------------------------------------------

function menuInstallAgent0() { menuInstallAgentByIndex(0); }
function menuInstallAgent1() { menuInstallAgentByIndex(1); }
function menuInstallAgent2() { menuInstallAgentByIndex(2); }
function menuInstallAgent3() { menuInstallAgentByIndex(3); }
function menuInstallAgent4() { menuInstallAgentByIndex(4); }
function menuInstallAgent5() { menuInstallAgentByIndex(5); }
function menuInstallAgent6() { menuInstallAgentByIndex(6); }
function menuInstallAgent7() { menuInstallAgentByIndex(7); }
function menuInstallAgent8() { menuInstallAgentByIndex(8); }
function menuInstallAgent9() { menuInstallAgentByIndex(9); }
function menuInstallAgent10() { menuInstallAgentByIndex(10); }
function menuInstallAgent11() { menuInstallAgentByIndex(11); }
function menuInstallAgent12() { menuInstallAgentByIndex(12); }
function menuInstallAgent13() { menuInstallAgentByIndex(13); }
function menuInstallAgent14() { menuInstallAgentByIndex(14); }
function menuInstallAgent15() { menuInstallAgentByIndex(15); }
function menuInstallAgent16() { menuInstallAgentByIndex(16); }
function menuInstallAgent17() { menuInstallAgentByIndex(17); }
function menuInstallAgent18() { menuInstallAgentByIndex(18); }
function menuInstallAgent19() { menuInstallAgentByIndex(19); }
function menuInstallAgent20() { menuInstallAgentByIndex(20); }
function menuInstallAgent21() { menuInstallAgentByIndex(21); }
function menuInstallAgent22() { menuInstallAgentByIndex(22); }
function menuInstallAgent23() { menuInstallAgentByIndex(23); }
function menuInstallAgent24() { menuInstallAgentByIndex(24); }
function menuInstallAgent25() { menuInstallAgentByIndex(25); }
function menuInstallAgent26() { menuInstallAgentByIndex(26); }
function menuInstallAgent27() { menuInstallAgentByIndex(27); }
function menuInstallAgent28() { menuInstallAgentByIndex(28); }
function menuInstallAgent29() { menuInstallAgentByIndex(29); }
function menuInstallAgent30() { menuInstallAgentByIndex(30); }
function menuInstallAgent31() { menuInstallAgentByIndex(31); }
function menuInstallAgent32() { menuInstallAgentByIndex(32); }
function menuInstallAgent33() { menuInstallAgentByIndex(33); }
function menuInstallAgent34() { menuInstallAgentByIndex(34); }
function menuInstallAgent35() { menuInstallAgentByIndex(35); }
function menuInstallAgent36() { menuInstallAgentByIndex(36); }
function menuInstallAgent37() { menuInstallAgentByIndex(37); }
function menuInstallAgent38() { menuInstallAgentByIndex(38); }
function menuInstallAgent39() { menuInstallAgentByIndex(39); }
function menuInstallAgent40() { menuInstallAgentByIndex(40); }
function menuInstallAgent41() { menuInstallAgentByIndex(41); }
function menuInstallAgent42() { menuInstallAgentByIndex(42); }
function menuInstallAgent43() { menuInstallAgentByIndex(43); }
function menuInstallAgent44() { menuInstallAgentByIndex(44); }
function menuInstallAgent45() { menuInstallAgentByIndex(45); }
function menuInstallAgent46() { menuInstallAgentByIndex(46); }
function menuInstallAgent47() { menuInstallAgentByIndex(47); }
function menuInstallAgent48() { menuInstallAgentByIndex(48); }
function menuInstallAgent49() { menuInstallAgentByIndex(49); }


function onOpen()
   {

   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addItem('Show Agent Sidebar...', "menuShowAgentSidebar")
         .addSubMenu(
               ui.createMenu("New...")
                     .addItem("Agent from Text...","menuNewAgentFromText")
                     .addSeparator()
                     .addItem("Sandbox Agent", "menuNewSandboxAgent")
                     //.addItem("Power On Self Test Mechanism no. 8 (POST-M8)", "menuNewSelfTestingAgent")
               )
         .addSeparator()
         .addItem("Step Agent", "menuStepAgent")
         .addItem("Step Block Pump", "menuStepBlockPump")
         .addSeparator()
         .addItem("Reinstall Agent", "menuReinstallAgent")
         .addItem("Uninstall Agent", "menuUninstallAgent")
         .addSeparator()
         .addSubMenu(
               ui.createMenu("Sentinel")
                     .addItem("Run", "menuRunSentinel")
                     .addItem("Stop", "menuStopSentinel")
               )
         .addSubMenu(
               ui.createMenu("Debug")
                  .addItem("Clear Output", "menuClearAgentOutput")
                  .addItem("Collect Garbage", "menuCollectGarbage")
                  .addSeparator()
                  .addItem("Write Document Properties", "menuWriteDocumentProperties")
                  .addSeparator()
                  .addItem("Write Agent Memory", "menuWriteAgentMemory")
                  .addItem("Read Agent Memory", "menuReadAgentMemory")
                  .addSeparator()
                  .addItem("Verify Permissions", "menuDebugVerifyPermissions")
                  .addSeparator()
                  .addItem("Sandbox", "menuDebugSandbox")
               )
         .addToUi();
   
   }


function menuDebugVerifyPermissions()
   {
   SpreadsheetApp.getActiveSheet().getRange(1, 49).setFormula('=VALUE(NOW())');
   console.log('GmailApp.getInboxUnreadCount() = ' + GmailApp.getInboxUnreadCount());
   }


function menuDebugSandbox()
   {
   }

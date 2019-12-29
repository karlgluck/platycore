
function onOpen()
   {

   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addSubMenu(
               ui.createMenu("New...")
                     .addItem("Agent from Text...","menuNewAgentFromText")
                     .addSeparator()
                     .addItem("Sandbox Agent", "menuNewSandboxAgent")
                     //.addItem("Power On Self Test Mechanism no. 8 (POST-M8)", "menuNewSelfTestingAgent")
               )
         .addSeparator()
         .addItem("Step Agent", "menuStepAgent")
         .addSeparator()
         .addItem("Reinstall Agent", "menuReinstallAgent")
         .addItem("Uninstall Agent", "menuUninstallAgent")
         .addSeparator()
         .addSubMenu(
               ui.createMenu("Sentinel")
                     .addItem("Run", "menuPlatycoreSentinel")
                     .addSeparator()
                     .addItem("Refresh", "menuRefreshSentinel")
                     .addItem("Stop", "menuStopSentinel")
               )
         .addSubMenu(
               ui.createMenu("Debug")
                  .addItem("Write Agent Memory", "menuWriteAgentMemory")
                  .addItem("Read Agent Memory", "menuReadAgentMemory")
                  .addItem("Test", "menuDebugTest")
               )
         .addToUi();
   
   }


function menuDebugTest()
   {
   SpreadsheetApp.getActiveSheet().getRange(1, 49).setFormula('=VALUE(NOW())')
   }


function onOpen()
   {

   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addSubMenu(
               ui.createMenu("New...")
                     .addItem("Agent from Text...","menuNewAgentFromText")
                     .addSeparator()
                     .addItem("Sandbox Agent", "menuNewAgent")
                     //.addItem("Power On Self Test Mechanism no. 8 (POST-M8)", "menuNewSelfTestingAgent")
               )
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
         // .addSubMenu(
         //       ui.createMenu("Debug")
         //          .addItem("Dummy", "menuPlatycoreSentinel")
         //       )
         .addToUi();
   
   }

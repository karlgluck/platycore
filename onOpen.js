
function onOpen()
   {

   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addSubMenu(
               ui.createMenu("New...")
                     .addItem("Sandbox Agent", "menuNewAgent")
                     .addItem("Power On Self Test Mechanism no. 8 (POST-M8)", "menuNewSelfTestingAgent")
               )
         .addSeparator()
         .addItem("Uninstall Agent", "menuUninstallAgent")
         .addSeparator()
         .addItem("Refresh Sentinel", "menuRefreshSentinel")
         .addItem("Stop Sentinel", "menuStopSentinel")
         .addToUi();
   
   }

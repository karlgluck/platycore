
function onOpen()
   {

   var isSentinelEnabled = GAS_isFunctionTriggeredP('triggerPlatycoreSentinel');

   var ui = SpreadsheetApp.getUi();
   var sentinelMenu = ui.createMenu("Sentinel")
         .addItem("Run", "triggerPlatycoreSentinel")
         .addSeparator();
   if (isSentinelEnabled)
      {
      sentinelMenu
            .addItem("Refresh", "menuRefreshSentinel")
            .addItem("Stop", "menuStopSentinel");
      }
   else
      {
      sentinelMenu
            .addItem("Start", "menuRefreshSentinel");
      }
   ui.createMenu("Platycore")
         .addSubMenu(
               ui.createMenu("New...")
                     .addItem("Sandbox Agent", "menuNewAgent")
                     .addItem("Power On Self Test Mechanism no. 8 (POST-M8)", "menuNewSelfTestingAgent")
               )
         .addSeparator()
         .addItem("Uninstall Agent", "menuUninstallAgent")
         .addSeparator()
         .addSubMenu(sentinelMenu)
         .addSubMenu(
               ui.createMenu("Debug")
                     .addItem("Run Sentinel", "triggerPlatycoreSentinel")
               )
         .addToUi();
   
   }

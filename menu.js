
function onOpen()
   {

   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addSubMenu(ui.createMenu("New...").addItem("Agent", "menuNewAgent"))
         .addSeparator()
         .addItem("Uninstall Agent", "menuUninstallAgent")
         .addSeparator()
         .addItem("Refresh Sentinel", "menuRefreshSentinel")
         .addItem("Stop Sentinel", "menuStopSentinel")
         .addToUi();
   
   }

function triggerPlatycoreSentinel ()
   {
   console.log('the time is ' + new Date());
   }

function menuRefreshSentinel ()
   {
   menuStopSentinel();
   ScriptApp.newTrigger('triggerPlatycoreSentinel').timeBased().everyMinutes(5).create();
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }

function menuStopSentinel ()
   {
   var triggers = ScriptApp.getProjectTriggers();
   for (var iTrigger = triggers.length - 1; iTrigger >= 0; --iTrigger)
      {
      var eTrigger = triggers[iTrigger];
      if (eTrigger.getHandlerFunction() == 'triggerPlatycoreSentinel')
         {
         ScriptApp.deleteTrigger(eTrigger);
         }
      }
   SpreadsheetApp.getActiveSpreadsheet().toast('There are ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
   }
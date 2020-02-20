
function onOpen()
   {

   var ui = SpreadsheetApp.getUi();
   ui.createMenu('Agent')
         .addItem('New...', 'menuNewAgent')
         .addSeparator()
         .addItem('Run once...', 'menuStepAgent')
         .addItem('Run selected note...', 'menuRunSelectedNote')
         .addSeparator()
         .addItem('Clear Output', 'menuClearAgentOutput')
         .addSeparator()
         .addItem('Uninstall', 'menuUninstallAgent')
         .addToUi();

   ui.createMenu('Pump')
         .addItem('Run Once...', 'menuStepBlockPump')
         .addSeparator()
         .addItem('Start', 'menuRunSentinel')
         .addItem('Stop', 'menuStopSentinel')
         .addToUi();

   ui.createMenu('Platycore')
         .addItem('Collect Garbage', 'menuCollectGarbage')
         .addToUi();
   
   }


var hasPlatycoreVerifiedPermissions = false;
function platycoreVerifyPermissions()
   {
   if (hasPlatycoreVerifiedPermissions)
      {
      return;
      }
   try
      {
      console.log('A1=' + SpreadsheetApp.getActiveSheet().getRange(1,1).getValue());
      console.log('GmailApp.getInboxUnreadCount() = ' + GmailApp.getInboxUnreadCount());
      hasPlatycoreVerifiedPermissions = true;
      }
   catch (e)
      {
      }
   }


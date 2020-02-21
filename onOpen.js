
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

   ui.createMenu('Platycore')
         .addItem('Run once...', 'menuStepBlockPump')
         .addSeparator()
         .addItem('Update file triggers...', 'menuUpdateDriveFileTriggers')
         .addSeparator()
         .addItem('Start automation', 'menuRunSentinel')
         .addItem('Stop automation', 'menuStopSentinel')
         //.addSeparator()
         //.addItem('Collect Garbage', 'menuCollectGarbage')
         .addToUi();
   
   }


var hasPlatycoreVerifiedPermissions = false;
function platycoreVerifyPermissions()
   {
   if (hasPlatycoreVerifiedPermissions)
      {
      return;
      }
   var userProperties = PropertiesService.getUserProperties();
   hasPlatycoreVerifiedPermissions = 'true' === userProperties.getProperty('hasPlatycoreVerifiedPermissions');
   try
      {
      console.log('[platycoreVerifyPermissions] A1=' + SpreadsheetApp.getActiveSheet().getRange(1,1).getValue());
      console.log('[platycoreVerifyPermissions] GmailApp.getInboxUnreadCount() = ' + GmailApp.getInboxUnreadCount());
      hasPlatycoreVerifiedPermissions = true;
      userProperties.setProperty('hasPlatycoreVerifiedPermissions', 'true');
      }
   catch (e)
      {
      }
   }


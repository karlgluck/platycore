function menuNewAgent()
   {
   platycoreVerifyPermissions();

   var html = HtmlService.createHtmlOutputFromFile('newAgentSidebar.html')
      .setTitle('New Agent')
      .setWidth(300);
   SpreadsheetApp.getUi().showSidebar(html);
   }

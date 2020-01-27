function menuShowAgentSidebar()
   {
  var html = HtmlService.createHtmlOutputFromFile('agentSidebar.html')
      .setTitle('Agent Sidebar')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
   }
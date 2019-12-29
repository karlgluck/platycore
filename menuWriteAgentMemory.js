function menuWriteAgentMemory()
   {
   SpreadsheetApp.getActiveRange().setValue(
         PropertiesService.getDocumentProperties().getProperty('platycoreAgent'+SpreadsheetApp.getActiveSheet().getSheetId())
         );
   }
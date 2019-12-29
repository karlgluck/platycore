function menuReadAgentMemory()
   {
   PropertiesService.getDocumentProperties().setProperty(
         'platycoreAgent'+SpreadsheetApp.getActiveSheet().getSheetId(),
         JSON.stringify(JSON.parse(SpreadsheetApp.getActiveRange().getValue()))
         );
   }
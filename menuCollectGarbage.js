function menuCollectGarbage()
   {
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var properties = PropertiesService.getDocumentProperties();

   var sheetIdSet = Util_GetSetFromObjectsP(spreadsheet.getSheets().map(function (eSheet) { return String(eSheet.getSheetId()) }));

   //
   // Remove agent keys for agents that don't exist anymore
   //
   properties.getKeys()
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' })
         .filter(function (e) { return Util_IsValueMissingFromSet(sheetIdSet, e.substring(14)) })
         .forEach(function (e)
            {
            console.log('removing unused platycore agent key ' + e);
            properties.deleteProperty(e);
            });
   }
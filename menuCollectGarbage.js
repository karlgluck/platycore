function menuCollectGarbage()
   {
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var properties = PropertiesService.getDocumentProperties();

   var sheetIdSet = Lang.MakeSetFromObjectsP(spreadsheet.getSheets().map(function (eSheet) { return String(eSheet.getSheetId()) }));

   //
   // Remove agent keys for agents that don't exist anymore
   //
   properties.getKeys()
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' })
         .filter(function (e) { return Lang.IsValueMissingFromSetP(sheetIdSet, e.substring(14)) })
         .forEach(function (e)
            {
            console.log('removing unused platycore agent key ' + e);
            properties.deleteProperty(e);
            
            var namedRanges = spreadsheet_.getNamedRanges();
            for (var iRange = namedRanges.length - 1; iRange >= 0; --iRange)
               {
               var eName = namedRanges[iRange].getName();
               if (eName.endsWith(e))
                  {
                  console.log('removing unused named range ' + eName);
                  spreadsheet_.removeNamedRange(eName);
                  }
               }
            });
   }
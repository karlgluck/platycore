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
            
            });


   //
   // Remove invalid named ranges
   //
   // var namedRanges = spreadsheet.getNamedRanges();
   // console.log('there are ' + namedRanges.length + ' named ranges');
   // for (var iRange = namedRanges.length - 1; iRange >= 0; --iRange)
   //    {
   //    if (!Lang.IsObject(namedRanges[iRange].getRange()))
   //       {
   //       console.log('removing unused named range ' + eName);
   //       spreadsheet.removeNamedRange(eName);
   //       }
   //    }
   
  var sheets = spreadsheet.getSheets();

  var sheetNamedRanges, loopRangeA1Notation;

  var x, i;
   for (x in sheets)
   {
   sheetNamedRanges = sheets[x].getNamedRanges();
   console.log('sheet ' + sheets[x].getName() + ' has ' + sheetNamedRanges.length + ' named ranges');
   // check for empty array
   if (sheetNamedRanges.length)
   {
      for (i = 0; i < sheetNamedRanges.length; i++)
      { // get A1 notation of referenced cells for testing purposes
         loopRangeA1Notation = sheetNamedRanges[i].getRange().getA1Notation();
         // check for length to prevent throwing errors during tests
         if (loopRangeA1Notation.length)
         { // check for bad reference
         // note: not sure why the trailing "!" mark is currently omitted
         // ....: so there are added tests to ensure future compatibility
         if (
            loopRangeA1Notation.slice(0,1) === "#"
            || loopRangeA1Notation.slice(-1) === "!"
         || loopRangeA1Notation.indexOf("REF") > -1
         )
         {
            console.log('removing dead named range ' + sheetNamedRanges[i].getName());
            sheetNamedRanges[i].remove();
         }
         }
      }
   }
   }

   }
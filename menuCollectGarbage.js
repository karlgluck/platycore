function menuCollectGarbage()
   {
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var properties = PropertiesService.getDocumentProperties();

   var sheetIdSet = Lang.MakeSetFromObjectsP(spreadsheet.getSheets().map(function (eSheet) { return String(eSheet.getSheetId()) }));

   //
   // Remove agent keys for agents that don't exist anymore
   //
   var propertyKeys = properties.getKeys();
   propertyKeys
         .filter(function (e) { return e.substring(0, 14) === 'platycoreAgent' })
         .filter(function (e) { return Lang.IsValueMissingFromSetP(sheetIdSet, e.substring(14)) })
         .forEach(function (e)
            {
            console.log('removing unused platycore agent key ' + e);
            properties.deleteProperty(e);
            });

   var channelsSheet = spreadsheet.getSheetByName('channels');
   if (!Lang.IsObject(channelsSheet))
      {
      channelsSheet = spreadsheet.insertSheet('channels', 0);
      }

   (function (qcMissingCols)
      {
      if (qcMissingCols > 0)
         {
         channelsSheet.insertRowsAfter(channelsSheet.getMaxRows(), qcMissingCols);
         }
      })(2 - channelsSheet.getMaxColumns());
   
   (function (qcAgentCheckboxes)
      {
      })();
   
   (function (qrDataRows, qcAgentCheckboxes)
      {
      if (qrDataRows > 0)
         {
         channelsSheet.getRange(2, 1, qrDataRows, 1).setNumberFormat('M/d/yyyy H:mm:ss');
         channelsSheet.setRowHeights(2, qrDataRows, 21);
         if (qcAgentCheckboxes > 0)
            {
            channelsSheet.setColumnWidths(3, qcAgentCheckboxes, 21);
            channelsSheet.getRange(2, 3, qrDataRows, qcAgentCheckboxes).insertCheckboxes();
            }
         }
      })(channelsSheet.getMaxRows() - 1, channelsSheet.getMaxColumns() - 2);


   channelsSheet.getRange(1, 1, 1, 1).setValue('last_updated');
   channelsSheet.getRange(1, 2, 1, 1).setValue('drive_file_url | agents').setTextRotation(45).setVerticalAlignment('middle').setHorizontalAlignment('center');
   channelsSheet.setRowHeight(1, 175);
   channelsSheet.setColumnWidth(2, 300);
   GAS.TrimSheetRows(channelsSheet);

   var icLastColumn = channelsSheet.getLastColumn();
   console.log(JSON.stringify(propertyKeys));
   var channelsAgentNames = icLastColumn > 2 ? channelsSheet.getRange(1,3, 1, icLastColumn - 2).getValues()[0] : [];
   var existingAgentNames = Object.keys(sheetIdSet).map(e => 'platycoreAgent'+e).filter(e => 0 <= propertyKeys.indexOf(e));
   var deadAgents = channelsAgentNames.filter(e => !existingAgentNames.includes(e));
   if (deadAgents.length > 0)
      {
      deadAgents.map(eAgentName => channelsAgentNames.indexOf(eAgentName) + 3)
            .reverse()
            .forEach(eicColumn => channelsSheet.deleteColumn(eicColumn));
      }
   var newAgents = existingAgentNames.filter(e => !channelsAgentNames.includes(e));
   if (newAgents.length > 0)
      {
      channelsSheet.insertColumnsAfter(2, newAgents.length);
      channelsSheet.getRange(1, 3, 1, newAgents.length).setValues([newAgents]).setTextRotation(90).setVerticalAlignment('bottom');
      channelsSheet.setColumnWidths(3, newAgents.length, channelsSheet.getRowHeight(2));
      var irLastRow = channelsSheet.getLastRow();
      if (irLastRow > 1)
         {
         channelsSheet.getRange(2, 3, irLastRow - 1, newAgents.length).insertCheckboxes();
         }
      }

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
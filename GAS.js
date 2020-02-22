var GAS = (function (ns) {


//------------------------------------------------------------------------------------------------------------------------------------
//
// 
//

ns.DeleteTriggerByName = function (functionName)
   {
   var triggers = ScriptApp.getProjectTriggers();
   for (var iTrigger = triggers.length - 1; iTrigger >= 0; --iTrigger)
      {
      var eTrigger = triggers[iTrigger];
      if (eTrigger.getHandlerFunction() == functionName)
         {
         ScriptApp.deleteTrigger(eTrigger);
         }
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------
//
// 
//

ns.IsTriggeredFunctionP = function (functionName)
   {
   return ScriptApp.getProjectTriggers().some(function (eTrigger) { return eTrigger.getHandlerFunction() == functionName });
   };

//------------------------------------------------------------------------------------------------------------------------------------
//
// 
//

ns.GetA1AddressFromCoordinatesP = function  (irRow, icColumn)
   {
   var iLetter, rvColumnLetters = '$';
   while (icColumn > 0)
      {
      iLetter = (icColumn - 1) % 26;
      rvColumnLetters = String.fromCharCode(65 + iLetter) + rvColumnLetters;
      icColumn = (icColumn - iLetter - 1) / 26;
      }
   return '$' + rvColumnLetters + (irRow >>> 0).toString(); // can't have more than 2^32 rows so >>> is ok
   };

//------------------------------------------------------------------------------------------------------------------------------------
//
// 
//

ns.UpdateConditionalFormatRule = function (sheet, irRow, icColumn, wcWidth, hrHeight, callback)
   {
   wcWidth = wcWidth || 1;
   hrHeight = hrHeight || 1;
   var shouldCreateRule = true;
   var rules = sheet.getConditionalFormatRules().map(function (eRule)
      {
      if (eRule.getRanges().some(function (eRange) { return eRange.getRow() === irRow && eRange.getColumn() === icColumn && eRange.getWidth() === wcWidth && eRange.getHeight() === hrHeight; }))
         {
         shouldCreateRule = false;
         return callback(eRule.copy()).build();
         }
      });
   if (shouldCreateRule)
      {
      rules.push(callback(SpreadsheetApp.newConditionalFormatRule().setRanges([sheet.getRange(irRow, icColumn, wcWidth, hrHeight)])).build());
      }
   sheet.setConditionalFormatRules(rules);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetUrlFromGmailMessage = function (gmailMessage)
   {
   return 'https://mail.google.com/mail/u/0/#inbox/' + gmailMessage.getId()
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetUrlFromSheet = function (sheet)
   {
   return sheet.getParent().getUrl() + '#gid='+sheet.getSheetId();
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsValidRangeNameP = function (name)
   {
   // https://support.google.com/docs/answer/63175
   return !name.match(/[^A-Za-z0-9_]|^true|^false|^.{250}.|^$/);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetSheetFromUrl = function (url)
   {
   var spreadsheet = SpreadsheetApp.openByUrl(url);
   if (!spreadsheet)
      {
      return null;
      }
   var match = url.match(/#gid=(\d+)/);
   var rvSheet = Lang.IsArray(match) ? ns.GetSheetFromSheetId(spreadsheet, Lang.intCast(match[1])) : null;
   return rvSheet;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetSheetFromSheetId = function (spreadsheet, sheetId)
   {
   var rvSheet = null;
   var sheets = spreadsheet.getSheets();
   for (var iSheet = 0, nSheetCount = sheets.length; iSheet < nSheetCount; ++iSheet)
      {
      var eSheet = sheets[iSheet];
      if (sheetId == eSheet.getSheetId())
         {
         rvSheet = eSheet;
         nSheetCount = 0;
         }
      }
   return rvSheet;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetObjectsFromSheetP = function (sheet)
   {
   return Lang.GetObjectsFromTableP(GAS.GetTableFromSheetP(sheet));
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.DictionaryFromSheetP = function (sheet, key)
   {
   return Lang.GetDictionaryFromTableP(GAS.GetTableFromSheetP(sheet), key);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetTableFromSheetP = function (sheet)
   {
   var irHeaders = Math.max(1, sheet.getFrozenRows());
   var qRows = sheet.getLastRow() - irHeaders + 1;
   var icLast = sheet.getLastColumn();
   return qRows <= 0 ? [] : sheet.getRange(irHeaders, 1, qRows, icLast).getValues();
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MergeSheetHeaders = function (sheet, requiredHeaders)
   {
   var irHeaderRow = sheet.getFrozenRows();  // Get the row index that contains all of the
   if (irHeaderRow < 1)                      // headers, and make sure we have at least a
      {                                      // single row available for them.
      sheet.insertRowsBefore(1, 1);
      sheet.setFrozenRows(1);
      irHeaderRow = 1;
      }

   var mcMaxColumns = sheet.getMaxColumns();
   var icLastColumn = sheet.getLastColumn();
   var icFirstColumn = sheet.getFrozenColumns() + 1;
   var qcColumns = icLastColumn - icFirstColumn + 1;
   var inputHeaders = qcColumns > 0 ? sheet.getRange(irHeaderRow, icFirstColumn, 1, qcColumns).getValues()[0] : [];
   var newlyAppendedHeaders = (requiredHeaders || []).filter(function (eHeader) { return -1 === inputHeaders.indexOf(eHeader); });
   var icLastColumnAfterAppending = icLastColumn + newlyAppendedHeaders.length;
   var qcExtraColumns = mcMaxColumns - icLastColumnAfterAppending;
   if (qcExtraColumns < 0)
      {
      sheet.insertColumnsAfter(Math.max(1, icLastColumn), -qcExtraColumns);
      }
   else if (qcExtraColumns > 0)
      {
      sheet.deleteColumns(icLastColumn + 1, qcExtraColumns);
      }
   if (newlyAppendedHeaders.length > 0)
      {
      sheet.getRange(irHeaderRow, icLastColumn + 1, 1, newlyAppendedHeaders.length).setValues([newlyAppendedHeaders])
      }
   var rvHeaders = inputHeaders.concat(newlyAppendedHeaders);
   return rvHeaders;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.AddRowsToJournalingSheet = function (rows, sheet)
   {
   if (rows.length < 1)
      {
      return;
      }
   var irFirstNewRow = sheet.getFrozenRows() + 1;
   sheet.insertRowsBefore(irFirstNewRow, rows.length);
   sheet.getRange(irFirstNewRow, 1, rows.length, rows[0].length).setValues(rows);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.LimitAndTrimSheetRows = function (sheet, qMaximumRows)
   {
   var irMaxRows = sheet.getMaxRows();
   var irFirstRowToDelete = Math.max(Math.min(sheet.getLastRow() + 1, qMaximumRows), sheet.getFrozenRows() + 2);
   var qrExtraRows = irMaxRows - irFirstRowToDelete + 1;
   if (qrExtraRows > 0)
      {
      sheet.deleteRows(irFirstRowToDelete, qrExtraRows);
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.TrimSheetRows = function (sheet)
   {
   var irMaxRows = sheet.getMaxRows();
   var irFirstRowToDelete = Math.max(sheet.getLastRow() + 1, sheet.getFrozenRows() + 2);
   var qrExtraRows = irMaxRows - irFirstRowToDelete + 1;
   if (qrExtraRows > 0)
      {
      sheet.deleteRows(irFirstRowToDelete, qrExtraRows);
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------

// ns.GetEditableConditionalFormatRules = function ()
//    {
//    return sheet_.getConditionalFormatRules().map(function (eRule)
//       {
//       return{
//             gasConditionalFormatRule: eRule,
//             ranges: eRule.getRanges().map(function (eRange)
//                {
//                return{
//                      r: eRange.getRow(),
//                      c: eRange.getColumn(),
//                      w: eRange.getWidth(),
//                      h: eRange.getHeight(),
//                      gasRange: eRange
//                      }
//                })
//             }
//       });
//    };
// getConditionalFormatRuleByArea = function (irRow, icColumn, qrHeight, qcWidth)
   //    {
   //    for (var i = 0, n = conditionalFormatRules_.length; i < n; ++i)
   //       {
   //       var eConditionalFormatRule = conditionalFormatRules_[i];
   //       var ranges = eConditionalFormatRule.ranges;
   //       if (ranges.length == 1 && ranges[0].r == irRow && ranges[0].c == icColumn && ranges[0].h == qrHeight && ranges[0].w == qcWidth)
   //          {
   //          return eConditionalFormatRule;
   //          }
   //       }
   //    return null;
   //    };


return ns;
})(GAS || {});
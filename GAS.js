var GAS = (function (ns) {


//------------------------------------------------------------------------------------------------------------------------------------

ns.CopyDocumentToFolderByUrl = function (documentUrl, fileName, folderUrl)
   {
   var file = DriveApp.getFileById(ns.GetFileIdFromUrl(documentUrl));
   var folder = DriveApp.getFolderById(ns.GetFileIdFromUrl(folderUrl));
   var copiedFile = file.makeCopy(folder);
   copiedFile.setName(fileName);
   var rvDocument = DocumentApp.openById(copiedFile.getId());
   rvDocument.setName(fileName);
   return rvDocument;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.CopyPresentationToFolderByUrl = function (presentationUrl, fileName, folderUrl)
   {
   var file = DriveApp.getFileById(ns.GetFileIdFromUrl(presentationUrl));
   var folder = DriveApp.getFolderById(ns.GetFileIdFromUrl(folderUrl));
   var copiedFile = file.makeCopy(folder);
   copiedFile.setName(fileName);
   var rvPresentation = SlidesApp.openById(copiedFile.getId());
   rvPresentation.setName(fileName);
   return rvPresentation;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.CopySpreadsheetToFolderByUrl = function (spreadsheetUrl, fileName, folderUrl)
   {
   var file = DriveApp.getFileById(ns.GetFileIdFromUrl(spreadsheetUrl));
   var folder = DriveApp.getFolderById(ns.GetFileIdFromUrl(folderUrl));
   var copiedFile = file.makeCopy(folder);
   copiedFile.setName(fileName);
   var rvSpreadsheet = SpreadsheetApp.openById(copiedFile.getId());
   rvSpreadsheet.setName(fileName);
   return rvSpreadsheet;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.CreateDocumentInFolderByUrl = function (name, folderUrl)
   {
   var document = DocumentApp.create(name);
   var file = DriveApp.getFileById(document.getId());
   var folder = DriveApp.getFolderById(ns.GetFileIdFromUrl(folderUrl));
   folder.addFile(file);
   DriveApp.getRootFolder().removeFile(file);
   return document;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetFileIdFromUrl = function (gsuiteUrl)
   {
   var match = gsuiteUrl.match(/[-\w]{25,}/);
   return match ? match[0] : null;
   };


//------------------------------------------------------------------------------------------------------------------------------------

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

ns.FindDescriptiveNameOfRange = function (range)
   {
   if (Lang.IsNotObjectP(range))
      {
      return "(none)";
      }

   var rvDescriptiveName = range.getA1Notation();

   var searchRow = range.getRow();
   var searchColumn = range.getColumn();
   var searchWidth = range.getWidth();
   var searchHeight = range.getHeight();

   var namedRanges = range.getSheet().getNamedRanges();
   for (var iRange = 0, nRangeCount = namedRanges.length; iRange < nRangeCount; ++iRange)
      {
      var eNamedRange = namedRanges[iRange];
      var eRange = eNamedRange.getRange();
      if (eRange.getRow() == searchRow &&
            eRange.getColumn() == searchColumn &&
            eRange.getWidth() == searchWidth &&
            eRange.getHeight() == searchHeight)
         {
         rvDescriptiveName += ' [' + eNamedRange.getName() + ']';
         }
      }

   return rvDescriptiveName;
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

ns.MakeA1AddressFromCoordinatesP = function  (irRow, icColumn)
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
   return Lang.IsStringP(name) && !name.match(/[^A-Za-z0-9_]|^true|^false|^.{250}.|^$/);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsNotValidRangeNameP = function (name)
   {
   return !ns.IsValidRangeNameP(name);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.OpenSheetUsingUrl = function (url)
   {
   var spreadsheet = SpreadsheetApp.openByUrl(url);
   if (!spreadsheet)
      {
      return null;
      }
   var match = url.match(/#gid=(\d+)/);
   var rvSheet = Lang.IsArrayP(match) ? ns.OpenSheetUsingSheetId(spreadsheet, Lang.MakeIntUsingAnyP(match[1])) : null;
   return rvSheet;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.OpenSheetUsingSheetId = function (spreadsheet, sheetId)
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

ns.MakeObjectsUsingSheetP = function (sheet)
   {
   return Lang.MakeObjectsUsingTableP(GAS.MakeTableUsingSheetP(sheet));
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeMapUsingSheetP = function (sheet, key)
   {
   return Lang.MakeMapUsingTableP(GAS.MakeTableUsingSheetP(sheet), key);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeTableUsingSheetP = function (sheet)
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
ns.WriteSheetUsingObjects = function (sheet, objects, headers)
   {
   ns.WriteSheetUsingTable(sheet, Lang.MakeTableUsingObjectsP(objects, headers));
   };

//------------------------------------------------------------------------------------------------------------------------------------
ns.WriteSheetUsingTable = function (sheet, table)
   {
   var range = ns.SetSheetTableSize(sheet, table.length, table[0].length);
   range.setValues(table);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.SetSheetTableSize = function (sheet, qrRows, qcColumns)
   {
   var irHeaderRow = Math.max(1, sheet.getFrozenRows());
   var irFirstDataRow = irHeaderRow + 1;

   var mrMaxRows = sheet.getMaxRows();
   var qrExtraRows = (mrMaxRows - irFirstDataRow + 1) - qrRows;
   if (qrExtraRows > 0)
      {
      sheet.deleteRows(mrMaxRows - qrExtraRows + 1, qrExtraRows);
      }
   else if (qrExtraRows < 0)
      {
      sheet.insertRowsAfter(mrMaxRows, -qrExtraRows)
      }
   
   var mrMaxColumns = sheet.getMaxColumns();
   var qrExtraColumns = mrMaxColumns - qcColumns;
   if (qrExtraColumns > 0)
      {
      sheet.deleteColumns(mrMaxColumns - qrExtraColumns + 1, qrExtraColumns);
      }
   else if (qrExtraColumns < 0)
      {
      sheet.insertColumnsAfter(mrMaxColumns, -qrExtraColumns)
      }

   return sheet.getRange(irHeaderRow, 1, qrRows, qcColumns);
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

ns.ApplyRetentionPolicyToSheet = function (policy, sheet)
   {

   var irFirstRowToDelete = sheet.getLastRow() + 1;
   if (Lang.IsNumberP(policy.qrRowCountLimit))
      {
      irFirstRowToDelete = Math.min(irFirstRowToDelete, policy.qrRowCountLimit);
      }
   irFirstRowToDelete = Math.max(irFirstRowToDelete, sheet.getFrozenRows() + 2);
   var irMaxRows = sheet.getMaxRows();
   var qrExtraRows = irMaxRows - irFirstRowToDelete + 1;
   if (qrExtraRows > 0)
      {
      sheet.deleteRows(irFirstRowToDelete, qrExtraRows);
      }

   if (Lang.IsNumberP(policy.utsOldestDateToKeep))
      {
      console.log('deleting everything older than ' + new Date(policy.utsOldestDateToKeep));
      if (Lang.IsNotStringP(policy.kDateColumnHeading))
         {
         policy.kDateColumnHeading = 'date';
         }
      var qrFrozenRows = sheet.getFrozenRows();
      var headers = sheet.getRange(qrFrozenRows, 1, sheet.getLastColumn(), 1).getValues()[0];
      var ciDateColumn = 1 + headers.indexOf(policy.kDateColumnHeading);
      var dateColumnRange = sheet.getRange(qrFrozenRows + 1, ciDateColumn, sheet.getLastRow() - qrFrozenRows, 1);
      var dates = dateColumnRange.getValues();
      var iLastDateToDelete = -1;
      for (var iDate = dates.length - 1; iDate >= 0; --iDate)
         {
         if (iLastDateToDelete < 0)
            {
            if (Lang.MakeDateUsingAnyP(dates[iDate]).getTime() < policy.utsOldestDateToKeep)
               {
               iLastDateToDelete = iDate;
               }
            }
         
         if (iLastDateToDelete >= 0)
            {
            if (Lang.MakeDateUsingAnyP(dates[iDate]).getTime() < policy.utsOldestDateToKeep)
               {
               if (iDate === 0)
                  {
                  sheet.deleteRows(qrFrozenRows + 1 + (iDate), iLastDateToDelete - (iDate) + 1);
                  iLastDateToDelete = -1;
                  }
               }
            else
               {
               sheet.deleteRows(qrFrozenRows + 1 + (iDate+1), iLastDateToDelete - (iDate+1) + 1);
               iLastDateToDelete = -1;
               }
            }
         }
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
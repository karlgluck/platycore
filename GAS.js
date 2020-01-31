

//------------------------------------------------------------------------------------------------------------------------------------
//
// 
//

GAS_deleteTriggerByName = function (functionName)
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

GAS_isFunctionTriggeredP = function (functionName)
   {
   return ScriptApp.getProjectTriggers().some(function (eTrigger) { return eTrigger.getHandlerFunction() == functionName });
   };

//------------------------------------------------------------------------------------------------------------------------------------
//
// 
//

function GAS_A1AddressFromCoordinatesP (irRow, icColumn)
   {
   var iLetter, rvColumnLetters = '$';
   while (icColumn > 0)
      {
      iLetter = (icColumn - 1) % 26;
      rvColumnLetters = String.fromCharCode(65 + iLetter) + rvColumnLetters;
      icColumn = (icColumn - iLetter - 1) / 26;
      }
   return '$' + rvColumnLetters + (irRow >>> 0).toString(); // can't have more than 2^32 rows so >>> is ok
   }

//------------------------------------------------------------------------------------------------------------------------------------
//
// 
//

var GAS_updateConditionalFormatRule = function (sheet, irRow, icColumn, wcWidth, hrHeight, callback)
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
   }

//------------------------------------------------------------------------------------------------------------------------------------

GAS_GetSheetFromUrl = function (url)
   {
   var spreadsheet = SpreadsheetApp.openByUrl(url);
   if (!spreadsheet)
      {
      return null;
      }
   var match = url.match(/#gid=(\d+)/);
   var sheets = spreadsheet.getSheets();
   var rvSheet = null;
   if (Util_isArray(match))
      {
      var sheetId = Util_intCast(match[1]);
      rvSheet = sheets.find(function (eSheet, iSheet)
         {
         return sheetId == eSheet.getSheetId();
         })
      }
   return rvSheet || sheets[0];
   };

//------------------------------------------------------------------------------------------------------------------------------------

GAS_ObjectsFromSheetP = function (sheet)
   {
   return Util_ObjectsFromTableP(GAS_TableFromSheetP(sheet));
   };

//------------------------------------------------------------------------------------------------------------------------------------

GAS_DictionaryFromSheetP = function (sheet, key)
   {
   return Util_DictionaryFromTableP(GAS_TableFromSheetP(sheet), key);
   };

//------------------------------------------------------------------------------------------------------------------------------------

GAS_TableFromSheetP = function (sheet)
   {
   var irHeaders = Math.max(1, sheet.getFrozenRows());
   var qRows = sheet.getLastRow() - irHeaders + 1;
   var icLast = sheet.getLastColumn();
   return qRows <= 0 ? [] : sheet.getRange(irHeaders, 1, qRows, icLast).getValues();
   };

//------------------------------------------------------------------------------------------------------------------------------------


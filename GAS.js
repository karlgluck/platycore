
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

GAS_isFunctionTriggeredP = function (functionName)
   {
   return ScriptApp.getProjectTriggers().some(function (eTrigger) { return eTrigger.getHandlerFunction() == functionName });
   };


function GAS_A1AddressFromCoordinatesP (irRow, icColumn)
   {
   var iLetter, rvColumnLetters = '$';
   while (icColumn > 0)
      {
      iLetter = (icColumn - 1) % 26;
      rvColumnLetters = String.fromCharCode(65 + iLetter) + rvColumnLetters;
      icColumn = (icColumn - iLetter - 1) / 26;
      }
   return '$' + rvColumnLetters + (irRow >>> 0).toString();
   }

function GAS_updateConditionalFormatRule (sheet, irRow, icColumn, wcWidth, hrHeight, callback)
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
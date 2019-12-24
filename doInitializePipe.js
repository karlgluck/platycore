
function getTriggerCount (val)
   {
   return ScriptApp.getProjectTriggers().length;
   }

function PIPE_LAUNCH(isEnabled, isLaunched)
   {
   if (isLaunched)
      {
      if (!isEnabled)
         {
         return '❌ set EN';
         }
      ScriptApp.newTrigger('triggerPipeLaunch').timeBased().after(100).create();
      var triggerCount = ScriptApp.getProjectTriggers().length;
      return '(' + triggerCount + ' pending)';
      }
   return 'LAUNCH';
   }

function triggerPipeLaunch()
   {
   GAS_deleteTriggerByName('triggerPipeLaunch');
   var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
   var sheets = spreadsheet.getSheets();
   for (var iSheet = 0, nSheetCount = sheets.length; iSheet < nSheetCount; ++iSheet)
      {
      var eSheet = sheets[iSheet];
      var range = eSheet.getRange(1, 1, 1, 3);
      var signature = range.getValues()[0];
      var isEnabled = signature[0] === true;
      var isPipe = signature[1] === 'EN';
      var isStarting = signature[2] === true;
      if (isEnabled && isPipe && isStarting)
         {
         range.setValues([[true, 'EN', false]]);
         var pipe = new Pipe(eSheet);
         pipe.log('pipe online');
         return;
         }
      }
   }

function menuNew()
   {
   var spreadsheet = SpreadsheetApp.getActive();

   var sheet = spreadsheet.getSheetByName('New Sheet');
   if (!!sheet)
      {
      spreadsheet.deleteSheet(sheet);
      }
   sheet = spreadsheet.insertSheet('New Sheet', spreadsheet.getActiveSheet().getIndex());
   sheet.activate();

   const qrFrozenRows = 12;

   var riHeaders = qrFrozenRows;
/*
   sheet.setFrozenRows(qrFrozenRows);
   sheet.getRange(riHeaders, 1, 1, 4).setValues([headers]);
   sheet.getRange(riHeaders, headers.length, sheet.getMaxRows()-riHeaders, qcColumns - headers.length).mergeAcross();
   sheet.deleteColumns(qcColumns, sheet.getMaxColumns() - qcColumns + 1);
*/

   sheet.setFrozenRows(qrFrozenRows);
   sheet.insertColumns(1, 23);
   sheet.setColumnWidths(1, 49, sheet.getRowHeight(1));
   var mrMaxRows = sheet.getMaxRows();
   var riFirstRowToDelete = riHeaders + 2;
   sheet.deleteRows(riFirstRowToDelete, mrMaxRows - riFirstRowToDelete + 1);
   mrMaxRows = riFirstRowToDelete - 1;
   sheet.getRange(1, 1, mrMaxRows, 49).setFontColor('#00ff00').setBackground('black').setFontFamily('Courier New').setVerticalAlignment('top');
   sheet.getRange(1, 1, 1, 49).setBackground('#434343');
   sheet.getRange(1, 1, 1, 1).insertCheckboxes();
   sheet.getRange(riHeaders, 1, 1, 1).setValue(' MESSAGES');
   sheet.getRange(1, 8).setFormula('=getTriggerCount()');

   var pipe = new Pipe(sheet, {verbose: true});
   pipe.info('Bringing the sheet online...');

   try
      {
      var toggleFromName = {
         'EN': {r:1, c:1},
         'TEST 1': {r:12, c:5},
         'ALBACORE': {r:12, c:9},
         'HELLO': {r:12, c:14},
         'LAUNCH': {r:1, c:3, f:'=PIPE_LAUNCH($A$1,$C$1)', w:5},
      };
      Object.keys(toggleFromName).forEach(function (kToggle)
         {
         var eToggle = toggleFromName[kToggle];
         var columnsFromLetters = [0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6];
         var toggleText = eToggle.t || eToggle.f || kToggle;
         var qcColumns;
         if (eToggle.hasOwnProperty('w'))
            {
            qcColumns = eToggle.w - 1;
            }
         else
            {
            qcColumns = columnsFromLetters[Math.min(columnsFromLetters.length-1, toggleText.length)];
            eToggle.w = qcColumns + 1;
            }
         pipe.log('+toggle: ' + kToggle + ' (' + toggleText + ')', eToggle.r, eToggle.c, eToggle.w);
         var checkboxRange = sheet.getRange(eToggle.r, eToggle.c).insertCheckboxes();
         eToggle.onColor = checkboxRange.getFontColor();
         eToggle.offColor = checkboxRange.getBackground();
         if (eToggle.onColor === '#00ff00') delete eToggle.onColor;
         if (eToggle.offColor === '#000000') delete eToggle.offColor;
         if (qcColumns > 0)
            {
            var range = sheet.getRange(eToggle.r, eToggle.c+1, 1, qcColumns).mergeAcross();
            if (eToggle.hasOwnProperty('f'))
               {
               pipe.log('setting formula ' + eToggle.f);
               range.setFormula(eToggle.f);
               }
            else
               {
               range.setValue(toggleText);
               }
            }
         });
      pipe.writeMetadata('toggleFromName', toggleFromName);
      }
   catch (e)
      {
      pipe.error('exception during toggle layout', e, e.stack);
      throw e;
      }

   try
      {
      pipe = new Pipe(sheet, {verbose: true});
      pipe.log('Rebooted. Starting self-test...');
      pipe.writeToggle('EN', true);
      pipe.log('verify EN toggle ON: ', pipe.readToggle('EN') ? 'ON' : 'OFF');
      pipe.writeToggle('EN', false);
      pipe.log('verify EN toggle OFF: ', pipe.readToggle('EN') ? 'ON' : 'OFF');
      }
   catch (e)
      {
      pipe.error('exception during post-toggle boot', e, e.stack);
      throw e;
      }


   /*var columnsFromLetters = [1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7];
   
   var nextColumn = 5;
   var writeColumn = function (name)
      {
      pipe.log('Adding logging flag "' + name + '"');
      sheet.getRange(riHeaders, nextColumn + 0, 1, 1).insertCheckboxes();
      sheet.getRange(riHeaders, nextColumn + 1, 1, 1).setValue(name);
      nextColumn += columnsFromLetters[name.length];
      };
   writeColumn('TEST 1');
   writeColumn('TESTINGY');
   writeColumn('YES INDEED');
   writeColumn('ENBL');
   */

   var pipe = new Pipe(sheet);
   pipe.log('Hello, World!');
   pipe.info('pipe.info example');

/*
   if (12 > qrFrozenRows)
      {
      spreadsheet.toast('Add at least 12 frozen rows');
      return;
      }
*/
   }

function getRangeNote(r,c)
   {
   return SpreadsheetApp.getActiveSheet().getRange(r,c).getNote();
   }

function Pipe (sheet_, options_)
   {

   options_ = options_ || {};

   //var verbose_ = options_.verbose || false;

   var metadataFromKey_ = {};

   this.writeMetadata = function (key, value)
      {
      sheet_.addDeveloperMetadata(key, JSON.stringify(value));
      };

   var toggleFromNameP_ = function (name)
      {
      var rvToggle = metadataFromKey_.toggleFromName[name];
      if (!rvToggle)
         {
         throw 'no toggle named "' + name + '"';
         }
      return rvToggle;
      }

   this.readToggle = function (name)
      {
      var toggle = toggleFromNameP_(name);
      if (!toggle.hasOwnProperty('hasBeenRead'))
         {
         var range = sheet_.getRange(toggle.r, toggle.c, 1, toggle.w);
         range.setBackground(toggle.isOn ? (toggle.onColor || '#00ff00') : (toggle.offColor || '#000000')).setFontColor(toggle.isOn ? (toggle.offColor || '#000000') : (toggle.onColor || '#00ff00'));
         }
      toggle.hasBeenRead = true;
      if (toggle.hasOwnProperty('isOn'))
         {
         return toggle.isOn;
         }
      toggle.isOn = !!range.getValue();
      return toggle.isOn;
      };

   this.peekToggleP = function (name)
      {
      var toggle = toggleFromNameP_(name);
      if (toggle.hasOwnProperty('isOn'))
         {
         return toggle.isOn;
         }
      return toggle.isOn = !!sheet_.getRange(toggle.r, toggle.c, 1, 1).getValue();
      };

   this.writeToggle = function (name, isOn)
      {
      isOn = !!isOn;
      var toggle = toggleFromNameP_(name);
      if (toggle.hasOwnProperty('isOn'))
         {
         if (toggle.isOn === isOn)
            {
            return;
            }
         }
      toggle.isOn = isOn;
      sheet_.getRange(toggle.r, toggle.c, 1, 1).setValue(isOn);
      sheet_.getRange(toggle.r, toggle.c, 1, toggle.w).setBackground(isOn ? (toggle.onColor || '#00ff00') : (toggle.offColor || '#000000')).setFontColor(isOn ? (toggle.offColor || '#000000') : (toggle.onColor || '#00ff00'));
      };
   

   var mcColumns_ = sheet_.getMaxColumns();
   var irNewMessage_ = sheet_.getFrozenRows() + 1;

   this.getMetadata = function () {
      return JSON.stringify(metadataFromKey_);
   };

   var writeOutputFirstTime_ = function (args)
      {
      var range = writeOutputNormal_(args);
      sheet_.getRange(irNewMessage_ + 1, 1, 1, 49)
            .setBorder(true, false, false, false, false, false, '#dadfe8', SpreadsheetApp.BorderStyle.SOLID_THICK);
      writeOutput_ = writeOutputNormal_;
      return range;
      };
   
   const startsFromArgCount = [[],[ 2],[ 2,21],[ 2,21,36],[ 2,21,29,40]];
   const countsFromArgCount = [[],[48],[19,29],[19,15,14],[19, 7,10, 9]];

   var writeOutputNormal_ = function (args)
      {
      var nArgCount = Math.min(args.length, startsFromArgCount.length - 1);
      var starts = startsFromArgCount[nArgCount];
      var counts = countsFromArgCount[nArgCount];
      sheet_.insertRowBefore(irNewMessage_);
      for (var iArg = nArgCount - 1; iArg >= 0; --iArg)
         {
         sheet_.getRange(irNewMessage_, starts[iArg], 1, counts[iArg]).mergeAcross().setValue(args[iArg]).setHorizontalAlignment('left');
         }
      //.setValue('▪').setVerticalAlignment('middle')
      sheet_.getRange(irNewMessage_, 1).setNote(JSON.stringify([new Date().toISOString()].concat(Object.keys(args).map(function (kArg){return args[kArg]}))));
      return sheet_.getRange(irNewMessage_, 1, 1, 49);
      };
   
   var writeOutput_ = writeOutputFirstTime_;
   
   // writes debug text to the output log for this sheet
   this.log = function (message)
      {
      writeOutput_(arguments).setFontColor('#ffffff').setBackground('black');
      };
   
   // writes an informational message to the output log for this sheet
   this.info = function (message)
      {
      writeOutput_(arguments).setFontColor('white').setBackground('black');
      };
   
   // writes a warning to the output log for this sheet
   this.warn = function (message)
      {
      writeOutput_(arguments).setFontColor('yellow').setBackground('#38340a');
      };

   // writes an error message to the output log for this sheet
   this.error = function (message)
      {
      writeOutput_(arguments).setFontColor('red').setBackground('#3d0404');
      };

   var isVerbose_ = function ()
      {
      var rvVerbose = false;
      if (options_.hasOwnProperty('verbose'))
         {
         rvVerbose = options_.verbose;
         }
      isVerbose_ = (function (value) { return function () { return value; }})(rvVerbose);
      return rvVerbose;
      };

   sheet_.getDeveloperMetadata().forEach(function (eMetadata)
      {
      var k = eMetadata.getKey(), v = eMetadata.getValue();
      metadataFromKey_[k] = JSON.parse(v);
      if (isVerbose_())
         {
         writeOutput_(['metadata: ' + k + ' = ' + v]);
         }
      });
   }

function getTriggerCount (val)
   {
   return ScriptApp.getProjectTriggers().length;
   }

// var getPipeLaunchFormula = function (toggleFromName)
//    {
//    Object.keys(toggleFromName).map(function (kToggle)
//       {
//       var eToggle = toggleFromName[kToggle];
//       if (eToggle.c > 25)
//          {
//          throw 'unable to configure anything past column 25 because we need to convert column index to letters past Z';
//          }
//       return eToggle.v + ',$' + String.fromCharCode(65 + eToggle.c + 1) + '$' + eToggle.r;
//       })
//       .join(',');
//    return '=PIPE_LAUNCH($A$1,'
//    }

// function PIPE_LAUNCH(isEnabled)
//    {
//    for (var iArgument = 1, iPair = 0, nArgumentCount = arguments.length; iArgument < nArgumentCount; iArgument += 2, ++iPair)
//       {
//       if (arguments[iArgument] != arguments[iArgument+1])
//          {
//          ScriptApp.newTrigger('triggerPipeLaunch').timeBased().after(100).create();
//          var triggerCount = ScriptApp.getProjectTriggers().length;
//          return '(' + triggerCount + ' pending)';
//          }
//       }
//    if (isLaunched)
//       {
//       if (!isEnabled)
//          {
//          return '❌ set EN';
//          }
//       }
//    return 'LAUNCH';
//    }

// function triggerPipeLaunch()
//    {
//    GAS_deleteTriggerByName('triggerPipeLaunch');
//    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
//    var sheets = spreadsheet.getSheets();
//    for (var iSheet = 0, nSheetCount = sheets.length; iSheet < nSheetCount; ++iSheet)
//       {
//       var eSheet = sheets[iSheet];
//       var range = eSheet.getRange(1, 1, 1, 3);
//       var signature = range.getValues()[0];
//       var isEnabled = signature[0] === true;
//       var isPipe = signature[1] === 'EN';
//       var isStarting = signature[2] === true;
//       if (isEnabled && isPipe && isStarting)
//          {
//          range.setValues([[true, 'EN', false]]);
//          var agent = new Agent(eSheet);
//          agent.log('agent online');
//          return;
//          }
//       }
//    }

function menuUninstallAgent()
   {
   var agent = new Agent(SpreadsheetApp.getActiveSheet());
   agent.uninstall();
   }

function menuNewAgent()
   {

   var spreadsheet = SpreadsheetApp.getActive();

   var sheet = spreadsheet.getSheetByName('New Agent');
   if (!!sheet)
      {
      spreadsheet.deleteSheet(sheet);
      }
   sheet = spreadsheet.insertSheet('New Agent', spreadsheet.getActiveSheet().getIndex());
   sheet.activate();

   sheet.addDeveloperMetadata('platycoreAgent', '{}');
   sheet.insertColumns(1, 23);
   sheet.setColumnWidths(1, 49, sheet.getRowHeight(1));

   try
      {
      var agent = new Agent(sheet, {verbose: true});
      var urlAgentInstructions = 'https://raw.githubusercontent.com/karlgluck/platycore/master/agents/sandbox.json';
      agent.info('Fetching ' + urlAgentInstructions);
      var jsonAgentInstructions = UrlFetchApp.fetch(urlAgentInstructions,{'headers':{'Cache-Control':'max-age=0'}}).getContentText();
      agent.info('jsonAgentInstructions', jsonAgentInstructions);
      var agentInstructions = JSON.parse(jsonAgentInstructions);
      //agent.writeMetadata('platycoreAgent',{key:'value'});
      //agent.writeMetadata('agentInstructions', agentInstructions);
      for (var iAgentInstruction = 0, nAgentInstructionCount = agentInstructions.length; iAgentInstruction < nAgentInstructionCount; ++iAgentInstruction)
         {
         var eAgentInstruction = agentInstructions[iAgentInstruction];
         switch (eAgentInstruction)
            {
            case 'freeze':
               var qrFrozenRows = agentInstructions[++iAgentInstruction] >>> 0;
               var riHeaders = qrFrozenRows;
               sheet.insertRowsBefore(1, qrFrozenRows);
               sheet.setFrozenRows(qrFrozenRows);
               var mrMaxRows = sheet.getMaxRows();
               var riFirstRowToDelete = Math.max(riHeaders + 2, sheet.getLastRow() + 1);
               sheet.deleteRows(riFirstRowToDelete, mrMaxRows - riFirstRowToDelete + 1);
               mrMaxRows = riFirstRowToDelete - 1;
               sheet.getRange(1, 1, mrMaxRows, 49).setFontColor('#00ff00').setBackground('black').setFontFamily('Courier New').setVerticalAlignment('top');
               sheet.getRange(1, 1, 1, 49).setBackground('#434343');
               sheet.getRange(riHeaders, 1, 1, 1).setValue(' MESSAGES');
               agent = agent.reboot();
               break;

            case 'name':
               var name = agentInstructions[++iAgentInstruction];
               agent.writeMetadata('name', name);
               agent.info('Building agent "' + name + '"');
               break;

            case 'info':
               agent.info(agentInstructions[++iAgentInstruction]);
               break;

            case 'eval':
               var code = agentInstructions[++iAgentInstruction];
               agent.log(code);
               eval(code);
               break;

            case 'uninstall':
               var script = agentInstructions[++iAgentInstruction].join('\n');
               agent.writeMetadata('uninstall', script);
               agent = agent.reboot();
               break;

            case 'toggleFromName':
               var toggleFromName = agentInstructions[++iAgentInstruction];
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
                  agent.log('+toggle: ' + kToggle + ' (' + toggleText + ')', eToggle.r, eToggle.c, eToggle.w);
                  var checkboxRange = sheet.getRange(eToggle.r, eToggle.c).insertCheckboxes();
                  eToggle.onColor = checkboxRange.getFontColor();
                  eToggle.offColor = checkboxRange.getBackground();
                  if (eToggle.v)
                     {
                     checkboxRange.setValue(true).setFontColor(eToggle.offColor).setBackground(eToggle.onColor);
                     }
                  if (qcColumns > 0)
                     {
                     var range = sheet.getRange(eToggle.r, eToggle.c+1, 1, qcColumns).mergeAcross();
                     if (eToggle.hasOwnProperty('f'))
                        {
                        range.setFormula(eToggle.f);
                        }
                     else
                        {
                        range.setValue(toggleText);
                        }
                     if (eToggle.v)
                        {
                        range.setFontColor(eToggle.offColor).setBackground(eToggle.onColor);
                        }
                     }
                  if (eToggle.onColor === '#00ff00') delete eToggle.onColor;
                  if (eToggle.offColor === '#000000') delete eToggle.offColor;
                  });
               agent.writeMetadata('toggleFromName', toggleFromName);
               agent = agent.reboot();
               break;
            }
         }
      }
   catch (e)
      {
      agent.error('exception during agent initialization', e, e.stack);
      return;
      }

   }

// function getRangeNote(r,c)
//    {
//    return SpreadsheetApp.getActiveSheet().getRange(r,c).getNote();
//    }

function Agent (sheet_, options_)
   {

   options_ = options_ || {};

   var metadataFromKey_ = {};

   this.reboot = function ()
      {
      return new Agent(sheet_, options_);
      };
   
   this.uninstall = function ()
      {
      if (metadataFromKey_.hasOwnProperty('uninstall'))
         {
         if (isVerbose_())
            {
            writeOutput_([metadataFromKey_.uninstall]);
            }
         try
            {
            eval(metadataFromKey_.uninstall);
            }
         catch (e)
            {
            }
         }
      sheet_.getParent().deleteSheet(sheet_);
      sheet_ = null;
      }

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
      writeOutput_(arguments).setFontColor('#00ff00').setBackground('black');
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
   
   if (!metadataFromKey_.hasOwnProperty('platycoreAgent'))
      {
      throw "not a platycore agent sheet";
      }
   }

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
      var agent = new Agent(sheet, {verbose: true, forceThisOn: true});
      var urlAgentInstructions = 'https://raw.githubusercontent.com/karlgluck/platycore/master/agents/sandbox.json';
      agent.info('Fetching ' + urlAgentInstructions);
      var jsonAgentInstructions = UrlFetchApp.fetch(urlAgentInstructions,{'headers':{'Cache-Control':'max-age=0'}}).getContentText();
      agent.info('jsonAgentInstructions', jsonAgentInstructions);
      var agentInstructions = JSON.parse(jsonAgentInstructions);
      //agent.writeMetadata('platycoreAgent',{key:'value'});
      //agent.writeMetadata('agentInstructions', agentInstructions);

      var dirty = {};
      var fieldFromName = {};
      var toggleFromName = {};
      var conditionalFormatRules = [];

      for (var iAgentInstruction = 0, nAgentInstructionCount = agentInstructions.length; iAgentInstruction < nAgentInstructionCount; ++iAgentInstruction)
         {
         var eAgentInstruction = agentInstructions[iAgentInstruction];
         switch (eAgentInstruction)
            {
            case 'freeze':
               var qrFrozenRows = agentInstructions[++iAgentInstruction] >>> 0;
               agent.verbose(function () { return 'freezing ' + qrFrozenRows + ' rows'; });
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

            case 'range':
               var rangeCommand = agentInstructions[++iAgentInstruction];
               var range = sheet.getRange(rangeCommand.r, rangeCommand.c);
               if (rangeCommand.hasOwnProperty('t'))
                  {
                  range.setValue(rangeCommand.t);
                  }
               if (rangeCommand.hasOwnProperty('f'))
                  {
                  range.setFormula(rangeCommand.f);
                  }
               if (rangeCommand.hasOwnProperty('bg'))
                  {
                  range.setBackground(rangeCommand.bg);
                  }
               if (rangeCommand.hasOwnProperty('fg'))
                  {
                  range.setFontColor(rangeCommand.fg);
                  }
               if (rangeCommand.hasOwnProperty('merge'))
                  {
                  switch (rangeCommand.merge)
                     {
                     case 'across': range.mergeAcross(); break;
                     case 'vertically': range.mergeVertically(); break;
                     default: range.merge(); break;
                     }
                  }
               break;

            case 'uninstall':
               var uninstallScript = agentInstructions[++iAgentInstruction].join('\n');
               agent.writeMetadata('uninstall', uninstallScript);
               agent = agent.reboot();
               break;

            case 'reboot':
               if (dirty.hasOwnProperty('fieldFromName'))
                  {
                  agent.verbose(function () { return ['saving fieldFromName', fieldFromName]; });
                  agent.writeMetadata('fieldFromName', fieldFromName);
                  delete dirty.fieldFromName;
                  }
               if (dirty.hasOwnProperty('toggleFromName'))
                  {
                  agent.verbose(function () { return ['saving toggleFromName', toggleFromName]; });
                  agent.writeMetadata('toggleFromName', toggleFromName);
                  delete dirty.toggleFromName;
                  }
               if (dirty.hasOwnProperty('conditionalFormatRules'))
                  {
                  agent.verbose(function () { return ['saving conditionalFormatRules', toggleFromName]; });
                  sheet.setConditionalFormatRules(conditionalFormatRules);
                  delete dirty.conditionalFormatRules;
                  }
               agent.verbose(function () { return 'reboot'; });
               agent = agent.reboot();
               break;

            case 'field':
               dirty.fieldFromName = true;
               (function (field)
                  {
                  if (!field.hasOwnProperty('h'))
                     {
                     field.h = 1;
                     }
                  fieldFromName[field.k] = field;
                  agent.log('+field: ' + field.k, field.r, field.c, field.h, field.w);
                  var range = sheet.getRange(field.r, field.c, field.h, field.w);
                  range.merge()
                        .setFontColor('#434343')
                        .setBackground('#ff9900')
                        .setHorizontalAlignment(field.h === 1 ? 'center' : 'left')
                        .setVerticalAlignment(field.h === 1 ? 'middle' : 'top')
                        .setBorder(true, true, true, true, false, false, '#efefef', SpreadsheetApp.BorderStyle.SOLID);
                  conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
                     .setRanges([range])
                     .whenTextEqualTo(input.value)
                     .setFontColor('white')
                     .setBackground('#073763'));
                  if (field.hasOwnProperty('value'))
                     {
                     self_.verbose(function () { return 'setting field value ' + field.value; });
                     range.setValue(field.value);
                     delete field.value;
                     }
                  })(agentInstructions[++iAgentInstruction]);
               break;

            case 'toggle':
               dirty.toggleFromName = true;
               (function (toggle)
                  {
                  toggleFromName[toggle.k] = toggle;
                  var columnsFromLetters = [0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6];
                  var toggleText = toggle.t || toggle.f || toggle.k;
                  var qcColumns;
                  if (toggle.hasOwnProperty('w'))
                     {
                     qcColumns = toggle.w - 1;
                     }
                  else
                     {
                     qcColumns = columnsFromLetters[Math.min(columnsFromLetters.length-1, toggleText.length)];
                     toggle.w = qcColumns + 1;
                     }
                  agent.log('+toggle: ' + toggle.k + ' (' + toggleText + ')', toggle.r, toggle.c, toggle.w);
                  var checkboxRange = sheet.getRange(toggle.r, toggle.c).insertCheckboxes();
                  toggle.onColor = checkboxRange.getFontColor();
                  toggle.offColor = checkboxRange.getBackground();
                  if (toggle.v)
                     {
                     checkboxRange.setValue(true).setFontColor(toggle.offColor).setBackground(toggle.onColor);
                     }
                  if (qcColumns > 0)
                     {
                     var range = sheet.getRange(toggle.r, toggle.c+1, 1, qcColumns).mergeAcross();
                     if (toggle.hasOwnProperty('f'))
                        {
                        range.setFormula(toggle.f);
                        }
                     else
                        {
                        range.setValue(toggleText);
                        }
                     if (toggle.hasOwnProperty('isOn'))
                        {
                        range.setFontColor(toggle.offColor).setBackground(toggle.onColor);
                        delete toggle.isOn;
                        }
                     }
                  if (toggle.onColor === '#00ff00') delete toggle.onColor;
                  if (toggle.offColor === '#000000') delete toggle.offColor;
                  delete toggle.k;
                  })(agentInstructions[++iAgentInstruction]);
               break;
            } // switch agent instruction
         } // for each agent instruction
      }
   catch (e)
      {
      if (!!agent)
         {
         agent.error('exception during agent initialization', e, e.stack);
         }
      spreadsheet.toast(e + ' ' + e.stack);
      return;
      }

   }
function newAgent (urlAgentInstructions)
   {

   var spreadsheet = SpreadsheetApp.getActive();

   var sheetName = 'New Agent';

   var sheet = spreadsheet.getSheetByName(sheetName);
   if (!!sheet)
      {
      spreadsheet.deleteSheet(sheet);
      }
   sheet = spreadsheet.insertSheet(sheetName, spreadsheet.getActiveSheet().getIndex());
   sheet.activate();
   sheet.insertColumns(1, 23);
   sheet.setColumnWidths(1, 49, sheet.getRowHeight(1));

   try
      {
      var memory = {
            sheetName: sheetName,
            sheetId: sheet.getSheetId(),
            urlAgentInstructions: urlAgentInstructions,
            fieldFromName: {},
            toggleFromName: {}
            };
      var agent = new Agent(sheet, memory, {verbose: true, forceThisOn: true});
      agent.info('Fetching ' + urlAgentInstructions);
      var jsonAgentInstructions = UrlFetchApp.fetch(urlAgentInstructions,{'headers':{'Cache-Control':'max-age=0'}}).getContentText();
      agent.info('jsonAgentInstructions', jsonAgentInstructions);
      var agentInstructions = JSON.parse(jsonAgentInstructions);

      var fieldFromName = memory.fieldFromName;
      var toggleFromName = memory.toggleFromName;

      var dirty = {};
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
               sheet.getRange(1, 1, mrMaxRows, 49)
                     .setFontColor('#00ff00')
                     .setBackground('black')
                     .setFontFamily('Courier New')
                     .setVerticalAlignment('top')
                     .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
               sheet.getRange(1, 1, 1, 49).setBackground('#434343');
               sheet.getRange(riHeaders, 1, 1, 4).merge().setValue(' MESSAGES');
               agent = agent.reboot();
               break;

            case 'name':
               var name = agentInstructions[++iAgentInstruction];
               memory.name = name;
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
               memory.uninstall = uninstallScript;
               agent = agent.reboot();
               break;

            case 'reboot':
               if (dirty.hasOwnProperty('conditionalFormatRules'))
                  {
                  agent.verbose(function () { return ['saving conditionalFormatRules']; });
                  sheet.setConditionalFormatRules(conditionalFormatRules);
                  delete dirty.conditionalFormatRules;
                  }
               agent.verbose(function () { return 'reboot'; });
               agent = agent.reboot();
               break;

            case 'field':
               dirty.conditionalFormatRules = true;
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
                        .setValue(field.value)
                        .setBackground(field.hasOwnProperty('bg') ? field.bg : '#000000')
                        .setBorder(true, true, true, true, false, false, field.borderColor || '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
                        .setHorizontalAlignment(field.h === 1 ? 'center' : 'left')
                        .setVerticalAlignment(field.h === 1 ? 'middle' : 'top');
                  if (field.isReadonly)
                     {
                     if (field.hasOwnProperty('fg'))
                        {
                        range.setFontColor(field.fg);
                        }
                     }
                  else
                     {
                     var fontColor = field.hasOwnProperty('fg') ? field.fg : '#dadfe8';
                     range.setFontColor('#ff00ff');
                     conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
                           .setRanges([range])
                           .whenTextEqualTo(field.value)
                           .setFontColor(fontColor));
                     }
                  if (field.hasOwnProperty('value'))
                     {
                     agent.verbose(function () { return 'setting field value ' + field.value; });
                     range.setValue(field.value);
                     }
                  })(agentInstructions[++iAgentInstruction]);
               break;

            case 'go':
               (function (go)
                  {
                  var toggles = Object.keys(toggleFromName).map(function (kName)
                     {
                     var eToggle = toggleFromName[kName];
                     return "NE(" + GAS_A1AddressFromCoordinatesP(eToggle.r, eToggle.c) + (!!eToggle.isOn ? ",TRUE)" : ",FALSE)");
                     });
                  var fields = Object.keys(fieldFromName).map(function (kName)
                     {
                     var eField = fieldFromName[kName];
                     return "NE(" + GAS_A1AddressFromCoordinatesP(eField.r, eField.c) + ',"' + String(eField.value).replace('"', '""') + '")';
                     });
                  var range = sheet.getRange(go.r, go.c).insertCheckboxes();
                  if (!toggleFromName.hasOwnProperty('EN'))
                     {
                     throw 'must declare EN toggle before declaring GO';
                     }
                  range.setFormula('=AND(' + GAS_A1AddressFromCoordinatesP(toggleFromName.EN.r,toggleFromName.EN.c) + ',OR(' + toggles.concat(fields).join(',') + '))');
                  sheet.getRange(go.r, go.c+1).setValue('GO');
                  toggleFromName['GO'] = { r: go.r, c: go.c, w: 2, h: 1, t: 'GO', isReadonly: true };
                  })(agentInstructions[++iAgentInstruction]);
               break;

            case 'onUpdate':
               var updateScript = agentInstructions[++iAgentInstruction];
               break;

            case 'toast':
               spreadsheet.toast(agentInstructions[++iAgentInstruction]);
               break;

            case 'toggle':
               dirty.toggleFromName = true;
               (function (toggle)
                  {
                  toggleFromName[toggle.k] = toggle;
                  var toggleText = toggle.t || toggle.k;
                  toggle.isReadonly = !!toggle.isReadonly;
                  toggle.isOn = !!toggle.isOn;
                  agent.log('+toggle: ' + toggle.k + ' (' + toggleText + ')' + (toggle.isReadonly ? ' [READONLY]' : ''), toggle.r, toggle.c, toggle.w);
                  var checkboxRange = sheet.getRange(toggle.r, toggle.c).insertCheckboxes();
                  if (toggle.isReadonly)
                     {
                     checkboxRange.setFormula(toggle.isOn ? '=TRUE' : '=FALSE');
                     }
                     else
                     {
                     checkboxRange.setValue(toggle.isOn);
                     }
                  var qcColumns = toggle.w - 1;
                  if (qcColumns > 0)
                     {
                     sheet.getRange(toggle.r, toggle.c+1, 1, qcColumns).mergeAcross().setValue(toggleText);
                     }
                  var range = sheet.getRange(toggle.r, toggle.c, 1, toggle.w);
                  if (toggle.hasOwnProperty('fg'))
                     {
                     range.setFontColor(toggle.fg); // explicit foreground color
                     delete toggle.fg;
                     }
                  else if (!toggle.isReadonly)
                     {
                     range.setFontColor('#dadfe8'); // editable
                     }
                  if (toggle.hasOwnProperty('bg'))
                     {
                     range.setBackground(toggle.bg);
                     delete toggle.bg;
                     }
                  if (!toggle.isReadonly)
                     {
                     conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
                           .setRanges([range])
                           .whenFormulaSatisfied((toggle.isOn ? '=EQ(FALSE,' : '=EQ(TRUE,') + GAS_A1AddressFromCoordinatesP(toggle.r, toggle.c) + ')')
                           .setFontColor('#ff00ff')
                           );
                     }
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
   finally
      {
      PropertiesService.getDocumentProperties().setProperty(
            'platycoreAgent' + memory.sheetId,
            JSON.stringify(memory)
            );
      }
   }
function newAgent (urlAgentInstructions, origin)
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
   var cellSize = sheet.getRowHeight(1);
   sheet.setColumnWidths(1, 49, cellSize);

   try
      {
      var utsNow = utsPlatycoreNow;
      var memory = {
            sheetName: sheetName,
            sheetId: sheet.getSheetId(),
            urlAgentInstructions: urlAgentInstructions,
            fieldFromName: {},
            toggleFromName: {},
            scriptFromName: {},
            scriptNames: [],
            utsLastSaved: utsNow
            };
      var agent = new Agent(sheet, {
            origin: origin || 'newAgent',
            utsSheetLastUpdated: utsNow,
            memory: memory,
            shouldReuseMemoryPointer: true,
            verbose: true,
            forceThisOn: true
            });
      agent.Save();
      agent.Info('Fetching ' + Util_clampStringLengthP(urlAgentInstructions, 50));
      if (urlAgentInstructions.substring(0, 22) === 'data:text/json;base64,')
         {
         var jsonAgentInstructions = Util_stringFromBase64(urlAgentInstructions.substring(22));
         }
      else
         {
         var jsonAgentInstructions = UrlFetchApp.fetch(urlAgentInstructions,{'headers':{'Cache-Control':'max-age=0'}}).getContentText();
         }
      agent.Info('jsonAgentInstructions', jsonAgentInstructions);
      var agentInstructions = JSON.parse(jsonAgentInstructions);

      var conditionalFormatRules = [];

      for (var iAgentInstruction = 0, nAgentInstructionCount = agentInstructions.length; iAgentInstruction < nAgentInstructionCount; ++iAgentInstruction)
         {
         var eAgentInstruction = agentInstructions[iAgentInstruction];

         if ('REBOOT' === eAgentInstruction || 'OFF' === eAgentInstruction || iAgentInstruction + 1 == nAgentInstructionCount) // save the conditional formatting rules before switching off
            {
            sheet.setConditionalFormatRules(conditionalFormatRules);
            }
         
         console.log('memory for ' + iAgentInstruction + ' = ', memory);

         switch (eAgentInstruction)
            {
            case 'NAME':
               var name = agentInstructions[++iAgentInstruction];
               memory.name = name;
               agent.Info('Building agent "' + name + '" (platycoreAgent' + sheet.getSheetId() + ')');
               break;

            case 'FREEZE':
               var qrFrozenRows = agentInstructions[++iAgentInstruction] >>> 0;
               agent.Verbose(function () { return 'freezing ' + qrFrozenRows + ' rows'; });
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
               sheet.getRange(1, 1, 1, 49)
                     .setBackground('#434343')
                     .setBorder(false, false, true, false, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
               sheet.getRange(riHeaders, 1, 1, 4).merge().setValue(' MESSAGES');
               console.log('before freeze boot, memory = ', memory);
               [agent, memory] = agent.Reboot();
               console.log('after freeze, memory = ', memory);
               break;

            case 'REBOOT':
               agent.Verbose(function () { return 'reboot'; });
               [agent, memory] = agent.Reboot();
               break;
            
            case 'OFF':
               agent.TurnOff();
               break;

            case 'INFO':
               agent.Info(agentInstructions[++iAgentInstruction]);
               break;

            case 'EVAL':
               var code = agentInstructions[++iAgentInstruction];
               agent.Log(code);
               eval(code);
               break;

            case 'RANGE':
               var rangeCommand = agentInstructions[++iAgentInstruction];
               var range = sheet.getRange(rangeCommand.r, rangeCommand.c, rangeCommand.h || 1, rangeCommand.w || 1);
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

            case 'UNINSTALL':
               var uninstallScript = agentInstructions[++iAgentInstruction].join('\n');
               memory.uninstall = uninstallScript;
               [agent, memory] = agent.Reboot();
               break;

            case 'FIELD':
               (function (field)
                  {
                  if (!field.hasOwnProperty('w'))
                     {
                     field.w = 1;
                     }
                  if (!field.hasOwnProperty('h'))
                     {
                     field.h = 1;
                     }
                  memory.fieldFromName[field.k] = field;
                  agent.Log('+field: ' + field.k, field.r, field.c, field.h, field.w);
                  var range = sheet.getRange(field.r, field.c, field.h, field.w);
                  range.merge()
                        .setBackground(field.hasOwnProperty('bg') ? field.bg : '#000000')
                        .setBorder(true, true, true, true, false, false, field.borderColor || '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
                        .setHorizontalAlignment(field.h === 1 ? 'center' : 'left')
                        .setVerticalAlignment(field.h === 1 ? 'middle' : 'top');
                  delete field.bg;
                  if (field.hasOwnProperty('value'))
                     {
                     range.setValue(field.value);
                     }
                  else if (field.hasOwnProperty('f'))
                     {
                     range.setFormula(field.f);
                     }
                  if (!field.hasOwnProperty('value'))
                     {
                     field.value = '';
                     }
                  var textStyleBuilder = range.getTextStyle().copy();
                  if (field.isReadonly)
                     {
                     var fontColor = field.hasOwnProperty('fg') ? field.fg : '#666666';
                     }
                  else
                     {
                     var fontColor = field.hasOwnProperty('fg') ? field.fg : '#00ffff';
                     textStyleBuilder.setUnderline(true);
                     }
                  textStyleBuilder.setForegroundColor('#ff00ff');
                  range.setTextStyle(textStyleBuilder.build());
                  conditionalFormatRules.push(SpreadsheetApp.newConditionalFormatRule()
                        .setRanges([range])
                        .whenTextEqualTo(field.value)
                        .setFontColor(fontColor));
                  delete field.fg;
                  })(agentInstructions[++iAgentInstruction]);
               break;

            case 'GO_EN':
               (function (goen)
                  {
                  var toggles = Object.keys(memory.toggleFromName).map(function (kName)
                     {
                     var eToggle = memory.toggleFromName[kName];
                     return "NE(" + GAS_A1AddressFromCoordinatesP(eToggle.r, eToggle.c) + (eToggle.valueCached ? ",TRUE)" : ",FALSE)");
                     });
                  var fields = Object.keys(memory.fieldFromName).map(function (kName)
                     {
                     var eField = memory.fieldFromName[kName];
                     return "NE(" + GAS_A1AddressFromCoordinatesP(eField.r, eField.c) + ',"' + String(eField.value).replace('"', '""') + '")';
                     });
                  var en = memory.toggleFromName['EN'] = { r: goen.r, c: goen.c + 2, w: 2, h: 1, t: 'EN', isReadonly: false };
                  var go = memory.toggleFromName['GO'] = { r: goen.r, c: goen.c, w: 2, h: 1, t: 'GO', isReadonly: true };
                  sheet.getRange(goen.r, goen.c).insertCheckboxes()
                        .setFormula('=AND(' + GAS_A1AddressFromCoordinatesP(en.r, en.c) + ',OR(' + toggles.concat(fields).join(',') + '))');
                  sheet.getRange(go.r, en.c).insertCheckboxes()
                        .setValue('false');
                  sheet.getRange(go.r, go.c+1)
                        .setFormula('=platycoreScheduler('+GAS_A1AddressFromCoordinatesP(go.r, go.c)+')');
                  sheet.getRange(en.r, en.c+1).setValue('EN');
                  sheet.getRange(en.r, en.c, 1, 2).setFontColor('#00ffff');
                  })(agentInstructions[++iAgentInstruction]);
               break;

            case 'SCRIPT': // SCRIPT "<name>" <qBlockCount> [{"r": "<riRow>", "c": "<ciCol>"} [<"code"> [, <"code">] ...for each line of code]] ...for each section
               var kName = agentInstructions[++iAgentInstruction];
               var qBlockCount = agentInstructions[++iAgentInstruction];
               var script = {blocks:[]};
               var backgroundColor = Util_rainbowColorFromValueP(Object.keys(memory.scriptFromName).length);
               for (var iBlock = 0; iBlock < qBlockCount; ++iBlock)
                  {
                  var blockProperties = agentInstructions[++iAgentInstruction];
                  var code = agentInstructions[++iAgentInstruction].join('\n');
                  blockProperties.valueCached = code;
                  script.blocks.push(blockProperties);
                  sheet.getRange(blockProperties.r, blockProperties.c)
                        .setVerticalAlignment('middle')
                        .setHorizontalAlignment('center')
                        .setNote(code)
                        .setBackground(backgroundColor)
                        .setBorder(true, true, true, true, true, true, '#434343', SpreadsheetApp.BorderStyle.SOLID_THICK)
                        .setValue(iBlock);
                  }
               agent.Log('+script: ' + kName, script.blocks);
               memory.scriptFromName[kName] = script;
               memory.scriptNames.push(kName);
               break;

            case 'TOAST':
               spreadsheet.toast(agentInstructions[++iAgentInstruction]);
               break;

            case 'TOGGLE':
               (function (toggle)
                  {
                  memory.toggleFromName[toggle.k] = toggle;
                  var toggleText = toggle.t || toggle.k;
                  toggle.isReadonly = !!toggle.isReadonly;
                  toggle.valueCached = !!toggle.value;
                  delete toggle.value;
                  agent.Log('+toggle: ' + toggle.k + ' (' + toggleText + ')' + (toggle.isReadonly ? ' [READONLY]' : ''), toggle.r, toggle.c, toggle.w);
                  var checkboxRange = sheet.getRange(toggle.r, toggle.c).insertCheckboxes();
                  if (toggle.isReadonly)
                     {
                     checkboxRange.setFormula(toggle.valueCached ? '=TRUE' : '=FALSE');
                     }
                     else
                     {
                     checkboxRange.setValue(toggle.valueCached);
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
                     range.setFontColor('#00ffff'); // editable
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
                           .whenFormulaSatisfied((toggle.valueCached ? '=EQ(FALSE,' : '=EQ(TRUE,') + GAS_A1AddressFromCoordinatesP(toggle.r, toggle.c) + ')')
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
         agent.Error('step ' + iAgentInstruction + ' threw an exception', iAgentInstruction, eAgentInstruction);
         agent.Error('exception during agent initialization', e, e.stack);
         }
      spreadsheet.toast(e + ' ' + e.stack);
      return;
      }
   finally
      {
      agent.Save();
      }
   }
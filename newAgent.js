function newAgent (urlAgentInstructions, previousInstallMemory, origin)
   {

   var spreadsheet = SpreadsheetApp.getActive();

   var sheetName = 'New Agent';

   var sheet = spreadsheet.getSheetByName(sheetName);
   if (!!sheet)
      {
      spreadsheet.deleteSheet(sheet);
      }
   sheet = spreadsheet.insertSheet(sheetName, spreadsheet.getActiveSheet().getIndex());
   PropertiesService.getDocumentProperties().setProperty('platycoreAgent' + sheet.getSheetId(), JSON.stringify({urlAgentInstructions:urlAgentInstructions})); // Save a minimal agent first so that reinstall always works
   sheet.activate();
   sheet.insertColumns(1, 23);
   var cellSize = sheet.getRowHeight(1);
   sheet.setColumnWidths(1, 49, cellSize);

   try
      {
      var utsNow = Util_utsNowGet();
      var memory = {
            fieldFromName: {},
            noteFromName: {},
            scriptFromName: {},
            scriptNames: [],
            sheetName: sheetName,
            sheetId: sheet.getSheetId(),
            toggleFromName: {},
            urlAgentInstructions: urlAgentInstructions,
            utsLastSaved: utsNow
            };
      var conditionalFormatRules = [];
      var agent = new Agent(sheet, {
            conditionalFormatRules: conditionalFormatRules,
            forceThisOn: true,
            memory: memory,
            origin: origin || 'newAgent',
            reusePointers: ['memory','conditionalFormatRules'],
            utsNow: utsNow,
            utsSheetLastUpdated: utsNow,
            verbose: true
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
      memory.agentInstructions = agentInstructions; // save so that reboots can do self-analysis

      for (var iAgentInstruction = 0, nAgentInstructionCount = agentInstructions.length; iAgentInstruction < nAgentInstructionCount; ++iAgentInstruction)
         {
         var eAgentInstruction = agentInstructions[iAgentInstruction];

         if ('REBOOT' === eAgentInstruction || 'OFF' === eAgentInstruction || iAgentInstruction + 1 == nAgentInstructionCount) // save the conditional formatting rules before switching off
            {
            sheet.setConditionalFormatRules(conditionalFormatRules.map(function (e) { return e.gasConditionalFormatRule; }));
            }

         switch (eAgentInstruction)
            {
            default:
               agent.Error('invalid instruction', eAgentInstruction);
               break;

            case 'NAME':
               var name = agentInstructions[++iAgentInstruction];
               memory.name = name;
               agent.Info('Building agent "' + name + '" (platycoreAgent' + sheet.getSheetId() + ')');
               break;
            
            case 'TOOLBAR':
               var irToolbar = agentInstructions[++iAgentInstruction];
               sheet.getRange(irToolbar, 1, 1, 49)
                     .setBackground('#434343')
                     .setBorder(false, false, true, false, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
               break;

            case 'FREEZE':
               var qrFrozenRows = agentInstructions[++iAgentInstruction];
               agent.Verbose(function () { return 'freezing ' + qrFrozenRows + ' rows'; });
               var irHeaders = qrFrozenRows;
               sheet.insertRowsBefore(1, qrFrozenRows);
               sheet.setFrozenRows(qrFrozenRows);
               var mrMaxRows = sheet.getMaxRows();
               var riFirstRowToDelete = Math.max(irHeaders + 2, sheet.getLastRow() + 1);
               sheet.deleteRows(riFirstRowToDelete, mrMaxRows - riFirstRowToDelete + 1);
               mrMaxRows = riFirstRowToDelete - 1;
               sheet.getRange(1, 1, mrMaxRows, 49)
                     .setFontColor('#00ff00')
                     .setBackground('black')
                     .setFontFamily('Courier New')
                     .setVerticalAlignment('top')
                     .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
               [agent, memory] = agent.Reboot();
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

            case 'REINSTALL': // execute code if this is a reinstall operation; guarantee access to the variable previousInstallMemory
               var code = agentInstructions[++iAgentInstruction].join('\n');
               if (Util_isObject(previousInstallMemory))
                  {
                  (function (agent, previousInstallMemory)
                     {
                     eval(code);
                     })(agent, previousInstallMemory);
                  }
               break;

            case 'EVAL':
               var code = agentInstructions[++iAgentInstruction].join('\n');
               (function (agent)
                  {
                  eval(code);
                  })(agent);
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
                  if (memory.fieldFromName.hasOwnProperty(field.k))
                     {
                     if (!field.hasOwnProperty('value')) // borrow the value from the existing one, if necessary (this lets us make virtual into "visible" fields)
                        {
                        field.value = memory.fieldFromName[field.k].valueCached;
                        }
                     }
                  memory.fieldFromName[field.k] = field;
                  if (field.hasOwnProperty('fVirtual'))
                     {
                     agent.Log('+field [VIRTUAL]: ' + field.k);
                     field.valueCached = field.value;
                     }
                  else
                     {
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
                        field.valueCached = field.value;
                        delete field.value;
                        range.setValue(field.valueCached);
                        }
                     else if (field.hasOwnProperty('f'))
                        {
                        range.setFormula(field.f);
                        }
                     else
                        {
                        field.valueCached = '';
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
                     delete field.fg;
                     textStyleBuilder.setForegroundColor('#ff00ff');
                     range.setTextStyle(textStyleBuilder.build());
                     conditionalFormatRules.push({
                           ranges:[{
                                 gasRange: range,
                                 r:field.r,
                                 c:field.c,
                                 h:field.h,
                                 w:field.w
                           }],
                           gasConditionalFormatRule: SpreadsheetApp.newConditionalFormatRule()
                                 .setRanges([range])
                                 .whenTextEqualTo(field.valueCached)
                                 .setFontColor(fontColor)
                                 .build()
                           });
                     }
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
                     return "NE(" + GAS_A1AddressFromCoordinatesP(eField.r, eField.c) + ',"' + String(eField.valueCached).replace('"', '""') + '")';
                     });
                  var en = memory.toggleFromName['EN'] = { r: goen.r, c: goen.c + 2, w: 2, h: 1, t: 'EN', isReadonly: false, valueCached: false };
                  var go = memory.toggleFromName['GO'] = { r: goen.r, c: goen.c, w: 2, h: 1, t: 'GO', isReadonly: true, valueCached: false };
                  sheet.getRange(goen.r, goen.c).insertCheckboxes()
                        .setFormula('=AND(' + GAS_A1AddressFromCoordinatesP(en.r, en.c) + ',OR(FALSE,' + toggles.concat(fields).join(',') + '))');
                  sheet.getRange(go.r, en.c).insertCheckboxes()
                        .setValue('false');
                  sheet.getRange(go.r, go.c+1)
                        .setFormula('=platycoreScheduler('+GAS_A1AddressFromCoordinatesP(go.r, go.c)+')');
                  sheet.getRange(en.r, en.c+1).setValue('EN');
                  var enRange = sheet.getRange(en.r, en.c, 1, 2).setFontColor('#00ffff');
                  conditionalFormatRules.push({
                        ranges:[{                                 // This is a copy-paste from the 'TOGGLE' branch,
                              gasRange: enRange,                  // so we should really move it somewhere else
                              r:en.r,                             // and refactor this into a single function.
                              c:en.c,
                              h:en.h,
                              w:en.w
                        }],
                        gasConditionalFormatRule: SpreadsheetApp.newConditionalFormatRule()
                              .setRanges([enRange])
                              .whenFormulaSatisfied((en.valueCached ? '=EQ(FALSE,' : '=EQ(TRUE,') + GAS_A1AddressFromCoordinatesP(en.r, en.c) + ')')
                              .setFontColor('#ff00ff')
                              .build()
                        });
                  })(agentInstructions[++iAgentInstruction]);
               break;
            
            case 'NOTE': // NOTE "<name>"  {"r": "<riRow>", "c": "<ciCol>"} <any>
               var kName = agentInstructions[++iAgentInstruction];
               var note = JSON.parse(JSON.stringify(agentInstructions[++iAgentInstruction]));
               var value = agentInstructions[++iAgentInstruction];
               memory.noteFromName[kName] = note;
               if (Util_isString(value))
                  {
                  // value = value;
                  }
               else if (Util_isArray(value) && value.every(function (e) { return Util_isString(e) }))
                  {
                  value = value.join('\n'); // this is an array of strings, so turn it into lines of text
                  }
               else
                  {
                  value = JSON.stringify(value);
                  }
               agent.Log(note);
               if (!note.hasOwnProperty('fVirtual'))
                  {
                  sheet.getRange(note.r, note.c).setNote(value);
                  }
               note.valueCached = value;
               break;
            
            case 'RAINBOW_BOX':
               var location = agentInstructions[++iAgentInstruction];
               var color = Util_rainbowColorFromAnyP(agentInstructions[++iAgentInstruction]);
               var value = agentInstructions[++iAgentInstruction];
               sheet.getRange(location.r, location.c)
                     .setVerticalAlignment('middle')
                     .setHorizontalAlignment('center')
                     .setBackground(color)
                     .setValue(value)
                     .setBorder(true, true, true, true, true, true, '#434343', SpreadsheetApp.BorderStyle.SOLID_THICK);
               break;
            
            case 'REM':
               console.log('REM ' + agentInstructions[++iAgentInstruction]);
               break;

            case 'SCRIPT': // SCRIPT "<name>" <qBlockCount>
               var kName = agentInstructions[++iAgentInstruction];
               var script = {blockCodeNoteNames:agentInstructions[++iAgentInstruction]};
               agent.Log('+script: ' + kName, script.blockCodeNoteNames);
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
                  conditionalFormatRules.push({
                        ranges:[{
                              gasRange: range,
                              r:toggle.r,
                              c:toggle.c,
                              h:1,
                              w:toggle.w
                        }],
                        gasConditionalFormatRule: SpreadsheetApp.newConditionalFormatRule()
                              .setRanges([range])
                              .whenFormulaSatisfied((toggle.valueCached ? '=EQ(FALSE,' : '=EQ(TRUE,') + GAS_A1AddressFromCoordinatesP(toggle.r, toggle.c) + ')')
                              .setFontColor('#ff00ff')
                              .build()
                        });
                  delete toggle.k;
                  })(agentInstructions[++iAgentInstruction]);
               break;
            } // switch agent instruction
         } // for each agent instruction

      }
   catch (e)
      {
      console.error(e, e.stack);
      spreadsheet.toast(e + ' ' + e.stack);
      try
         {
         agent.Error('step ' + iAgentInstruction + ' threw an exception', iAgentInstruction, eAgentInstruction);
         agent.Error('exception during agent initialization', e, e.stack);
         }
      catch (e2)
         {
         console.error(e2, e2.stack);
         }
      return;
      }
   finally
      {
      try
         {
         agent.Save();
         var utsWakeValue = agent.ReadField('WAKE');
         if (Util_isNumber(utsWakeValue))
            {
            var dtMilliseconds = Math.max(15000, (utsWakeValue - Util_utsNowGet()) / 1000);
            console.log('Scheduling sentinel after ' + Util_stopwatchStringFromDurationInMillis(dtMilliseconds) + ' = ' + dtMilliseconds);
            ScriptApp.newTrigger('triggerPlatycoreSentinel').timeBased().after(dtMilliseconds).create();
            }
         spreadsheet.toast('platycoreAgent' + sheet.getSheetId() + ' installed successfully.');
         }
      catch (e)
         {
         console.error(e, e.stack);
         }
      }
   }
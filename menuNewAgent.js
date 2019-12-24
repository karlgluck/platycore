
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
      if (!!agent)
         {
         agent.error('exception during agent initialization', e, e.stack);
         }
      spreadsheet.toast(e + ' ' + e.stack);
      return;
      }

   }
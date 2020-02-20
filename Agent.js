
function Agent (sheet_, previousInstallMemory)
   {
   var self_ = this;
   var kAgentId_ = 'A'+sheet_.getSheetId();
   var isThisOn_ = false;
   var isThisPrebooted_ = false;
   var spreadsheet_ = sheet_.getParent();
   var irNewMessage_ = 2;
   var readonlyNames_ = [];

//------------------------------------------------------------------------------------------------------------------------------------

   var getRangeNameFromPropertyName = function (name)
      {
      return kAgentId_ + '_' + name;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   var getRangeFromPropertyName = function (name)
      {
      return spreadsheet_.getRangeByName(kAgentId_ + '_' + name);
      };
   
//------------------------------------------------------------------------------------------------------------------------------------

   this.GetName = function ()
      {
      return sheet_.getName();
      };
   
//------------------------------------------------------------------------------------------------------------------------------------

   this.GetAgentId = function ()
      {
      return kAgentId_;
      };


/*************************************************************************************************************************************
******            ****     *********     *******     ****   *******         **********************************************************
***********   ******   ****   ****  ****   ***  ****   **   *******   ****************************************************************
***********   ****   ********   *   *********   *********   *******   ****************************************************************
***********   ****   ********   *   *********   *********   *******       ************************************************************
***********   ****   ********   *   ***     *   ***     *   *******   ****************************************************************
***********   ******   *****   ***   ****  ***   ****  **   *******   ****************************************************************
***********   ********     ********      ******      ****         *         **********************************************************
*************************************************************************************************************************************/

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadToggle = function (name, ignoreCache)
      {
      var range = getRangeFromPropertyName(name);
      return Lang.IsObject(range) ? range.isChecked() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteToggle = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObject(range))
         {
         value = Lang.boolCast(value);
         if (readonlyNames_.indexOf(name) >= 0)
            {
            range.setFormula(value ? '=TRUE' : '=FALSE');
            }
         else
            {
            range.setValue(value);
            }
         }
      else 
         {
         self_.Warn('WriteToggle(name="'+name+'",value='+value+'): name does not exist');
         }
      };

/*************************************************************************************************************************************
******         ***   ****         ***   *********      *******************************************************************************
******   *********   ****   *********   *********   ***   ****************************************************************************
******   *********   ****   *********   *********   ****   ***************************************************************************
******       *****   ****       *****   *********   ****   ***************************************************************************
******   *********   ****   *********   *********   ****   ***************************************************************************
******   *********   ****   *********   *********   ***   ****************************************************************************
******   *********   ****         ***         ***      *******************************************************************************
*************************************************************************************************************************************/

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadField = function (name, ignoreCache)
      {
      var range = getRangeFromPropertyName(name);
      return Lang.IsObject(range) ? range.getValue() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteField = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObject(range))
         {
         range.setValue(value);
         }
      else 
         {
         self_.Warn('WriteField(name="'+name+'",value='+value+'): name does not exist');
         }
      };

/*************************************************************************************************************************************
******    *****   *****     *****            *         *******************************************************************************
******  *   ***   ***   ****   *******   *****   *************************************************************************************
******   *   **   *   ********   *****   *****   *************************************************************************************
******   **   *   *   ********   *****   *****       *********************************************************************************
******   ***  *   *   ********   *****   *****   *************************************************************************************
******   ****  *  ***   *****   ******   *****   *************************************************************************************
******   ******   *****     **********   *****         *******************************************************************************
*************************************************************************************************************************************/

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadNote = function (name, ignoreCache)
      {
      var range = getRangeFromPropertyName(name);
      return Lang.IsObject(range) ? range.getNote() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteNote = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObject(range))
         {
         range.setNote(Lang.stringCast(value));
         }
      else 
         {
         self_.Warn('WriteNote(name="'+name+'",value='+value+'): name does not exist');
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------
// 
// "Find" is used rather than "Get" to convey the higher
// cost of invoking this function.
//

   this.FindNameUsingRangeP = function (range)
      {
      var searchRow = range.getRow();
      var searchColumn = range.getColumn();
      var searchWidth = range.getWidth();
      var searchHeight = range.getHeight();

      var namedRanges = spreadsheet_.getNamedRanges();
      for (var iRange = 0, nRangeCount = namedRanges.length; iRange < nRangeCount; ++iRange)
         {
         var eNamedRange = namedRanges[iRange];
         var eRange = eNamedRange.getRange();
         if (eRange.getRow() == searchRow &&
               eRange.getColumn() == searchColumn &&
               eRange.getWidth() == searchWidth &&
               eRange.getHeight() == searchHeight)
            {
            return eNamedRange.getName().substring(getRangeNameFromPropertyName('').length);
            }
         }
      return null;
      };

/*************************************************************************************************************************************
******      *****         *   *   ****   *****   ****     ****************************************************************************
******   ***   **   *******  ****   **   *****   **  ****   **************************************************************************
******   ****   *   *******  *****   *   *****   *   *********************************************************************************
******   ****   *       ***    *  ****   *****   *   *********************************************************************************
******   ****   *   *******  *****   *   *****   *   ***     *************************************************************************
******   ***   **   *******  ******  *   *****   **   ****  **************************************************************************
******      *****         *     *   ****      ******      ****************************************************************************
*************************************************************************************************************************************/

   var writeOutputFirstTime_ = function (badge, args)
      {
      sheet_.insertRowsBefore(irNewMessage_, 1);
      var rvRange = writeOutputNormal_(badge, args);
      sheet_.getRange(rvRange.getRow() + 1, 1, 1, 49)
            .setBorder(true, false, false, false, false, false, '#b7b7b7', SpreadsheetApp.BorderStyle.SOLID_THICK);
      writeOutput_ = writeOutputNormal_;
      return rvRange;
      };

   var writeOutputNormal_ = function (badge, args)
      {
      var startsFromArgCount = [[],[ 2],[ 2,21],[ 2,21,36],[ 2,21,29,40]];
      var countsFromArgCount = [[],[48],[19,29],[19,15,14],[19, 7,10, 9]];
      var nArgCount = Math.min(args.length, startsFromArgCount.length - 1);
      var starts = startsFromArgCount[nArgCount];
      var counts = countsFromArgCount[nArgCount];
      sheet_.insertRowBefore(irNewMessage_);
      var values = Lang.MakeArray(49, null);
      values[0] = badge;
      for (var iArg = nArgCount - 1; iArg >= 0; --iArg)
         {
         values[starts[iArg]-1] = String(args[iArg]).replace(/\r?\n/g, '⏎');
         }
      var range = sheet_.getRange(irNewMessage_, 1, 1, 49);
      var notes = Lang.MakeArray(49, null);
      notes[0] = new Date().toISOString() + '\n\n' + Lang.GetStackTrace(4) + '\n\n' + Object.keys(args).map(function (kArg){return args[kArg]}).join('\n\n');
      range.setValues([values]).setNotes([notes]);
      // for some reason this never works to shrink autosized rows
      //sheet_.setRowHeights(irNewMessage_, sheet_.getMaxRows() - irNewMessage_, 21);
      return range;
      };
   
   var writeOutput_ = writeOutputFirstTime_;

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes debug text to the output log for this sheet
//

   this.Log = function (message)
      {
      console.log.apply(console, arguments);
      writeOutput_('', arguments).setFontColor('#b7b7b7').setBackground('black');
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.LogWithBadge = function (badge, message)
      {
      console.log.apply(console, arguments);
      writeOutput_(badge, Array(arguments).slice(1)).setFontColor('#b7b7b7').setBackground('black');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes an informational message to the output log for this sheet
//

   this.Info = function (message)
      {
      console.info.apply(console, arguments);
      writeOutput_('', arguments).setFontColor('white').setBackground('black');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes a warning to the output log for this sheet
//

   this.Warn = function (message)
      {
      console.warn.apply(console, arguments);
      writeOutput_('⚠️', arguments).setFontColor('yellow').setBackground('#38340a');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes an error message to the output log for this sheet
//

   this.Error = function (message)
      {
      console.error.apply(console, arguments);
      writeOutput_('❌', arguments).setFontColor('red').setBackground('#3d0404');
      };

/*************************************************************************************************************************************
**********     ******        ***         *        ***********  *******            *         ******************************************
********   ****   ***   ****   *   *******   ****   ********  *  **********   *****   ************************************************
******   ********   *   ****   *   *******   ****   *******  **   *********   *****   ************************************************
******   ********   *        ***       ***  *   **********   ***   ********   *****       ********************************************
******   ********   *   ********   *******   **   *******       *   *******   *****   ************************************************
********   *****   **   ********   *******   ****   ****   *******   ******   *****   ************************************************
**********     ******   ********         *   ******   *   *********   *****   *****         ******************************************
*************************************************************************************************************************************/


//------------------------------------------------------------------------------------------------------------------------------------

   this.Save = function ()
      {
      console.log('saving agent ' + self_.GetName());
      sheet_.getRange('A1').setNote(
            '  READONLY ' + JSON.stringify(readonlyNames_)
            // +'\n'
            );
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.Uninstall = function ()
      {
      var valueFromPropertyName = {};
      var qPrefixLength = getRangeNameFromPropertyName('').length;
      sheet_.getNamedRanges().forEach(function (eRange)
         {
         valueFromPropertyName[eRange.getName().substring(qPrefixLength)] = eRange.getRange().getValue();
         eRange.remove();
         });
      spreadsheet_.deleteSheet(sheet_);
      sheet_ = null;
      isThisOn_ = false;
      isThisPrebooted_ = false;
      console.log('[Uninstall] valueFromPropertyName', valueFromPropertyName);

      var documentCache = CacheService.getDocumentCache();
      documentCache.put(kAgentId_, JSON.stringify(valueFromPropertyName));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.TurnOn = function ()
      {
      if (!isThisPrebooted_)
         {
         throw "not prebooted";
         }
      if (isThisOn_)
         {
         return true;
         }
      var isAlreadyRunning = self_.ReadToggle('ON', true);
      var lockValue = self_.ReadField('LOCK', true);
      var hasLockField = !Lang.IsUndefined(lockValue);
      if (hasLockField)
         {
         lockValue = Lang.intCast(lockValue);
         var lockValueWithSentinel = (lockValue - (lockValue % 1000)) + (((lockValue % 1000) + 1) % 1000);
         self_.WriteField('LOCK', lockValueWithSentinel);
         var canOverrideLock = Platycore.PumpRuntimeLimit < (Lang.GetTimestampNow() - lockValue);
         }
      else
         {
         var lockValueWithSentinel = null;
         var canOverrideLock = false;
         }

      var canTurnOn = !isAlreadyRunning || (hasLockField && canOverrideLock);
      if (canTurnOn)
         {
         var lock = LockService.getDocumentLock();
         if (!lock.tryLock(Platycore.DocumentTryLockWaitTime))
            {
            lock = null;
            }
         }
      else
         {
         var lock = null;
         }

      if (null !== lock)
         {
         try
            {
               isAlreadyRunning = Lang.boolCast(self_.ReadToggle('ON', true));
               if (hasLockField)
                  {
                  canTurnOn = self_.ReadField('LOCK', true) === lockValueWithSentinel
                        && (!isAlreadyRunning || canOverrideLock);
                  }
               else
                  {
                  canTurnOn = !isAlreadyRunning;
                  }

            if (canTurnOn)
               {
               self_.WriteField('LOCK', Lang.GetTimestampNow());
               self_.WriteToggle('ON', true);
               isThisOn_ = true;
               }
            else
               {
               spreadsheet_.toast(self_.GetName() + ': could not turn on');
               }
            }
         catch (e)
            {
            self_.Error('TurnOn', e);
            isThisOn_ = false;
            }
         finally
            {
            lock.releaseLock();
            lock = null;
            }
         }
      return isThisOn_;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.TurnOff = function ()
      {
      if (!isThisOn_)
         {
         return;
         }
      self_.Save();
      isThisOn_ = false;
      var lock = LockService.getDocumentLock();
      if (lock.tryLock(Platycore.DocumentTryLockWaitTime))
         {
         try
            {
            self_.WriteToggle('ON', false);
            }
         finally
            {
            lock.releaseLock();
            lock = null;
            }
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Execute the code in the note named by the field SCRIPT,
// given all of these things exist and are valid.
//

   this.Step = function ()
      {
      if (!isThisOn_)
         {
         throw "must be turned on, otherwise the program might not have exclusive control of the agent"
         }
   
      var script = self_.ReadField('SCRIPT');
      if (Lang.IsUndefined(script))
         {
         self_.Warn('This agent does not do anything when activated because there is no SCRIPT field');
         return;
         }

      var rv = this.EvalNoteByName(script);
      };


//------------------------------------------------------------------------------------------------------------------------------------
//
// Execute the code in the note named
//

   this.EvalNoteByName = function (noteName)
      {
      if (!isThisOn_)
         {
         throw "must be turned on, otherwise the program might not have exclusive control of the agent"
         }

      var code = self_.ReadNote(noteName);
      if (Lang.IsUndefined(code))
         {
         self_.Error('There is no note with the given name: ' + noteName);
         return null;
         }

      var rv = this.EvalCode (code, noteName);
      return rv;
      };


//------------------------------------------------------------------------------------------------------------------------------------
//
// Execute the code in the currently selected note
//

   this.EvalSelectedNote = function ()
      {
      if (!isThisOn_)
         {
         throw "must be turned on, otherwise the program might not have exclusive control of the agent"
         }

      var cellRange = SpreadsheetApp.getCurrentCell();
      var code = cellRange.getNote();
      var rv = null;
      if (Lang.IsString(code))
         {
         rv = this.EvalCode(code);
         }

      return rv;
      };


//------------------------------------------------------------------------------------------------------------------------------------
//
// Execute the code passed as the first parameter. The
// second parameter is used as a label in debug output.
//
   
   this.EvalCode = function (code, sourceLabel)
      {
      
      // Script code references the "agent" variable,
      // whereas code here in the script itself uses 
      // 'self_' (to distinguish it from 'this'!).
      // Clear on all the differences? Good!

      return (function (agent)
         {
         var lineNumber = 0;
         var codeLines = code.split('\n');
         try
            {
            eval(codeLines
                  .map(function (e, i) { return e.replace(/;\s$/,';lineNumber='+(i+1)+';'); })
                  .join('\n'));
            }
         catch (e)
            {
            self_.Error((sourceLabel || '[eval]')
                  + '(~' + lineNumber + '): ' + (e.message || e.toString()) + '\n\n'
                  + codeLines
                        .map(function (e, i) { return Lang.GetStringWithLeadingZeroesFromNumber(i, 4) + ': ' + e; })
                        .slice(
                        Math.max(lineNumber-2,0),
                        Math.min(codeLines.length-1,lineNumber+3)
                        )
                        .join('\n')
                  + '\n\n'
                  + (Lang.IsUndefined(e.stack) ? '     no stack trace' : e.stack)
                  );
            }
         })(self_);

      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// When snoozing, the agent may be woken up any point in the future
// (including immediately). This is what would make it distinct from
// Sleep, which would always last for a minimum duration.
// 
// Snoozing for a duration simply asks Platycore to check in on this
// agent in the future. Snoozing forever disables this check, but
// the agent can still be woken up other ways.
//
// There are basically no guarantees about the amount of time snoozing
// actually puts the agent to sleep... but "rest" assured that it does
// ...something like what you would expect, but with some asterisks.
//
// One thing's for sure, though: if you want regular execution intervals,
// do NOT rely on Snooze.
//

//------------------------------------------------------------------------------------------------------------------------------------

   this.Snooze = function (dtMilliseconds)
      {
      var utsNow = Lang.GetTimestampNow();
      dtMilliseconds = Math.max(15000, dtMilliseconds);
      var maybePreviousWakeTime = self_.ReadField('WAKE');
      var utsNewWakeTime = utsNow + dtMilliseconds;
      if (Lang.IsNumber(maybePreviousWakeTime))
         {
         maybePreviousWakeTime = Lang.intCast(maybePreviousWakeTime);
         if (maybePreviousWakeTime < utsNow && maybePreviousWakeTime > (utsNow - dtMilliseconds))
            {
            utsNewWakeTime = maybePreviousWakeTime + dtMilliseconds;
            }
         }
      self_.WriteField('WAKE', utsNewWakeTime); // note the lack of protection for only incrementing or decrementing this value. It just does whatever!
      self_.LogWithBadge(
            Lang.GetMoonPhaseFromDate(new Date(utsNewWakeTime)),
            'snoozing for ' + Lang.stopwatchStringFromDuration(dtMilliseconds) + ' until ' + Lang.stopwatchStringFromDuration(utsNewWakeTime - Lang.GetTimestampNow()) + ' from now at ' + Lang.GetWallTimeFromTimestamp(utsNewWakeTime)
            );
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.SnoozeForever = function ()
      {
      self_.Log(Lang.GetMoonPhaseFromDate(Lang.GetTimestampNow()) + 'Snoozing, no alarm... ');
      self_.WriteField('WAKE', 'SNOOZE');
      };

   var getRoutineTextFromUrl = function (urlAgentInstructions)
      {
      var dataUrlPrefix = 'data:application/x-gzip;base64,';
      if (urlAgentInstructions.substring(0, dataUrlPrefix.length) === dataUrlPrefix)
         {
         var agentInstructionsText = Lang.GetStringFromBase64Gzip(urlAgentInstructions.substring(dataUrlPrefix.length));
         }
      else
         {
         var agentInstructionsText = UrlFetchApp.fetch(urlAgentInstructions,{'headers':{'Cache-Control':'max-age=0'}}).getContentText();
         }
      return agentInstructionsText;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ExecuteRoutineFromUrl = function (urlAgentInstructions)
      {
      if (Platycore.Verbose)
         {
         self_.Info('Fetching ' + Lang.ClampStringLengthP(urlAgentInstructions, 50));
         }
      return self_.ExecuteRoutineFromText(getRoutineTextFromUrl(urlAgentInstructions));
      };

   var getRoutineFromText = function (agentInstructionsText)
      {
      var multilineObjectConcatenationRegex = new RegExp(/{---+}\s---+\s([\s\S]*?)[\r\n]---+/gm);
      var multilineConcatenationRegex = new RegExp(/"---+"\s---+\s([\s\S]*?)[\r\n]---+/gm);
      var whitespaceRegex = new RegExp(/^\s/);
      var associativeSplitRegex = new RegExp(/^\s+(\S+)\s*(.*)/);
      var agentInstructions = agentInstructionsText
            .replace(multilineObjectConcatenationRegex, function (matched, group, index) // allow easy multi-line concatenation
               {
               return JSON.parse(group);
               })
            .replace(multilineConcatenationRegex, function (matched, group, index) // allow easy multi-line concatenation
               {
               return JSON.stringify(group);
               })
            .split(/\n/)
            .filter(function (eLine)   // strip every line that doesn't start with whitespace
               {
               return eLine.trim().length > 0 && Lang.boolCast(whitespaceRegex.exec(eLine))
               })
            .map(function (eLine)      // take the first token and the rest of the line as 2 elements
               {
               var match = associativeSplitRegex.exec(eLine);
               if (Lang.IsArray(match))
                  {
                  return match.slice(1);
                  }
               else
                  {
                  if (Platycore.Verbose)
                     {
                     self_.Warn('invalid line: ' + eLine);
                     }
                  return ['REM', JSON.stringify(eLine)];
                  }
               })
            .reduce(function (accumulator, eCommandInstructionPair, currentIndex) // merge "+" lines
               {
               if (currentIndex > 0 && '+' === eCommandInstructionPair[0])
                  {
                  accumulator[accumulator.length - 1][1] += "," + eCommandInstructionPair[1];
                  }
               else
                  {
                  accumulator.push(eCommandInstructionPair)
                  }
               return accumulator;
               }, [])
            .map(function (eCommandInstructionPair) // build some JSON lines
               {
               return JSON.stringify(eCommandInstructionPair[0]) + ',[' + eCommandInstructionPair[1] + ']'
               })
            ;

      agentInstructionsText = '[' + agentInstructions.join(',') + ']';
      return JSON.parse(agentInstructionsText);
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ExecuteRoutineFromText = function (agentInstructionsText)
      {
      var routine = getRoutineFromText(agentInstructionsText);
      return self_.ExecuteRoutine(routine);
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Runs a routine. Routines are diferent from scripts in
// while scripts contain Javascript code, Routines contain
// a list of assembly-like instructions. This provides a
// generic text interace for manipulating the structure of
// the agent in the same way that Platycore does.
//

   this.ExecuteRoutine = function (instructions)
      {
      if (!Lang.IsArray(instructions)) throw "instructions";

      var selectedRange = null;
      var mergingInstructionsSet = Lang.MakeSetFromObjectsP(['FORMULA', 'TOGGLE', 'FIELD', 'TEXT']);
      var previousAgentValueFromPropertyName = null;
      var installationUrl = null;
      
      for (var iInstruction = 1, nInstructionCount = instructions.length; iInstruction < nInstructionCount; iInstruction += 2)
         {
         var eInstruction = instructions[iInstruction - 1];
         var eArguments   = instructions[iInstruction - 0];
         var eArgumentSet = Lang.MakeSetFromObjectsP(eArguments);

         if (Lang.IsValueContainedInSetP(eInstruction, mergingInstructionsSet))
            {
            switch (((selectedRange.getWidth() > 1) ? 1 : 0) + ((selectedRange.getHeight() > 1) ? 2 : 0))
               {
               case 1: /* w   */ selectedRange.mergeAcross(); break;
               case 2: /* h   */ selectedRange.mergeVertically(); break;
               case 3: /* w+h */ selectedRange.merge(); break;
               }
            }

         console.log(eInstruction);

         switch (eInstruction)
            {
            default:
               self_.Error('invalid instruction', eInstruction);
               break;

            case 'INTERACTIVE_ONLY':
               if (!Lang.IsObject(SpreadsheetApp.getActive()))
                  {
                  return;
                  }
               break;

            case 'UPGRADE':
               previousAgentValueFromPropertyName = (function (v)
                  {
                  try
                     {
                     return JSON.parse(v);
                     }
                  catch (e)
                     {
                     return null;
                     }
                  })(CacheService.getDocumentCache().get(Lang.stringCast(eArguments[0])));
               self_.Log('upgrading from ' + eArguments[0], JSON.stringify(previousAgentValueFromPropertyName));
               break;

            case 'INSTALL':
               isThisOn_ = true;
               installationUrl = Lang.stringCast(eArguments[0]);
               try
                  {
                  instructions = instructions.concat(getRoutineFromText(getRoutineTextFromUrl(installationUrl)));
                  nInstructionCount = instructions.length;
                  }
               catch (e)
                  {
                  self_.Error('Unable to INSTALL:' + String(e), e.stack);
                  nInstructionCount = 0;
                  }
               break;
            
            case 'UNINSTALL':
               self_.Uninstall();
               break;

            case 'CONTINUE_IN_NEW_AGENT':
               var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
               sheet.getRange('A1').insertCheckboxes().check().setNote('  REM "CONTINUE_IN_NEW_AGENT"');
               var agent = new Agent(sheet);
               if (agent.Preboot())
                  {
                  agent.ExecuteRoutine(instructions.slice(iInstruction+1))
                  }
               iInstruction = nInstructionCount;
               break;

            case 'WRITE_REINSTALL_NOTE':
               // selectedRange.setNote(
               //       'Run this note to reinstall ' + kAgentId_
               //       + '\n  INTERACTIVE_ONLY'
               //       + '\n  UNINSTALL'
               //       + '\n  CONTINUE_IN_NEW_AGENT'
               //       + '\n  UPGRADE "' + kAgentId_ + '"'
               //       + '\n  INSTALL "' + installationUrl + '"'
               //    );
               if (Lang.IsString(installationUrl))
                  {
                  selectedRange.setNote(
                        'agent.ExecuteRoutineFromText('
                        + '"\\n  INTERACTIVE_ONLY'
                        + '\\n  UNINSTALL'
                        + '\\n  CONTINUE_IN_NEW_AGENT'
                        + '\\n  UPGRADE \\"' + kAgentId_ + '\\"'
                        + '\\n  INSTALL \\"' + installationUrl + '\\"")'
                        );
                  }
               else
                  {
                  self_.Warn('WRITE_REINSTALL_NOTE has no installationUrl; ignoring');
                  }
               break;

            case 'IF_REINSTALLING': // execute code if this is a reinstall operation; guarantee access to the variable previousAgentValueFromPropertyName
               var code = eArguments.join('\n');
               if (Lang.IsObject(previousAgentValueFromPropertyName))
                  {
                  (function (agent, previousAgentValueFromPropertyName)
                     {
                     eval(code);
                     })(self_, previousAgentValueFromPropertyName);
                  }
               break;

            case 'SELECT':
               selectedRange = sheet_.getRange(eArguments[0]);
               break;

            case 'NAME':
               var name = Lang.stringCast(eArguments[0]);
               sheet_.setName(name + sheet_.getSheetId());
               break;

            case 'FREEZE':
               sheet_.setFrozenRows(Lang.intCast(eArguments[0]));
               break;

            case 'RESERVE':
               
               var mrMaxRows = sheet_.getMaxRows();
               var mrMaxColumns = sheet_.getMaxColumns();
               sheet_.getRange(1, 1, mrMaxRows, mrMaxColumns)
                     .setFontColor('#b7b7b7')
                     .setBackground('black')
                     .setFontFamily('IBM Plex Mono')
                     .setVerticalAlignment('top')
                     .setWrap(false)
                     .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

               sheet_.setRowHeights(1, mrMaxRows, 21);
               sheet_.setColumnWidths(1, sheet_.getMaxColumns(), 21); // square the cells

               var qcExtraColumns = mrMaxColumns - 49;
               var icLastColumn = sheet_.getLastColumn();
               if (qcExtraColumns < 0)
                  {
                  sheet_.insertColumnsAfter(Math.max(1, icLastColumn), -qcExtraColumns);
                  }
               else if (qcExtraColumns > 0)
                  {
                  sheet_.deleteColumns(mrMaxColumns - qcExtraColumns + 1, qcExtraColumns);
                  }
               mrMaxColumns = 49;

               var qrRows = Lang.intCast(eArguments[0]);
               var irHeaders = qrRows;
               sheet_.insertRowsBefore(irNewMessage_, qrRows);
               mrMaxRows += qrRows;
               irNewMessage_ = qrRows + 1;
               var riFirstRowToDelete = Math.max(irHeaders + 2, sheet_.getLastRow() + 1);
               sheet_.deleteRows(riFirstRowToDelete, mrMaxRows - riFirstRowToDelete + 1);
               mrMaxRows = riFirstRowToDelete - 1;

               sheet_.getRange(qrRows, 1, 1, mrMaxColumns).setBorder(false, false, true, false, false, false, '#b7b7b7', SpreadsheetApp.BorderStyle.SOLID_THICK);
               sheet_.getRange(1, 1, qrRows, 1).mergeVertically().setBackground('#b7b7b7').setFontColor('#000000');
               var logRange = sheet_.getRange(qrRows, 1, mrMaxRows-qrRows+1, sheet_.getMaxColumns());
               logRange.setWrap(false).setWrapStrategy(SpreadsheetApp.WrapStrategy.OVERFLOW);
               //spreadsheet_.setNamedRange(getRangeNameFromPropertyName('LOG'), sheet_.getRange(qrRows, 1, mrMaxRows-qrRows+1, sheet_.getMaxColumns()));
               break;

            case 'OFF':
               self_.TurnOff();
               break;

            case 'INFO':
               self_.Info(eArguments.join('\n'));
               break;

            case 'WARN':
               self_.Warn(eArguments.join('\n'));
               break;

            case 'ERROR':
               self_.Error(eArguments.join('\n'));
               break;

            case 'EVAL':
               var code = eArguments.join('\n');
               (function (agent)
                  {
                  eval(code);
                  })(self_);
               break;
            
            case 'FORMULA':
               var formula = eArguments[0];
               selectedRange.setFormula(formula);
               break;
            
            case 'TEXT':
               var text = eArguments[0];
               selectedRange.setValue(text);
               break;

            case 'FORMAT':
               switch (eArguments[0])
                  {
                  case 'DATETIME': selectedRange.setNumberFormat('M/d/yyyy H:mm:ss'); break;
                  case 'CHECKBOX': selectedRange.setNumberFormat('"☑";"☐"'); break;
                  default: selectedRange.setNumberFormat(eArguments[0]); break;
                  }
               break;

            case 'READONLY':
               readonlyNames_ = Lang.arrayCast(eArguments[1]);
               break;

            case 'TOGGLE':
               var kName = eArguments[0];
               selectedRange.insertCheckboxes();
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kName), selectedRange);
               if (Lang.IsValueContainedInSetP('READONLY', eArgumentSet))
                  {
                  readonlyNames_.push(kName);
                  }
               else
                  {
                  selectedRange.setFontColor('#00ffff'); // editable
                  }
               var value = Lang.IsValueContainedInSetP('TRUE', eArgumentSet);
               if (Lang.IsValueContainedInSetP('UPGRADE', eArgumentSet))
                  {
                  var previousValue;
                  if (Lang.IsObject(previousAgentValueFromPropertyName)
                        && Lang.IsMeaningful(previousValue = previousAgentValueFromPropertyName[kName]))
                     {
                     value = previousValue;
                     }
                  }
               self_.Log('+toggle: ' + kName, value);
               self_.WriteToggle(kName, value);
               break;

            case 'FIELD':
               var kName = eArguments[0];
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kName), selectedRange);
               var textStyleBuilder = selectedRange.getTextStyle().copy();
               if (Lang.IsValueContainedInSetP('READONLY', eArgumentSet))
                  {
                  readonlyNames_.push(kName);
                  textStyleBuilder.setForegroundColor('#666666');
                  }
               else
                  {
                  textStyleBuilder
                        .setForegroundColor('#00ffff')
                        .setUnderline(true);
                  }
               selectedRange.setTextStyle(textStyleBuilder.build());
               var value = '';
               console.log('upgrading field ' + kName + ' from ', previousAgentValueFromPropertyName);
               if (Lang.IsValueContainedInSetP('UPGRADE', eArgumentSet))
                  {
                  var previousValue;
                  if (Lang.IsObject(previousAgentValueFromPropertyName)
                        && Lang.IsMeaningful(previousValue = previousAgentValueFromPropertyName[kName]))
                     {
                     value = previousValue;
                     }
                  }
               if (Lang.IsMeaningful(value))
                  {
                  self_.WriteField(kName, value);
                  }
               self_.Log('+field: ' + kName, value);
               break;
            
            case 'NOTE':
               var kName = eArguments[0];
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kName), selectedRange);
               var value = eArguments.slice(1).join('\n');
               // doesn't apply, but the principle is the same -- maybe unify these?
               // if (Lang.IsValueContainedInSetP('UPGRADE', eArgumentSet))
               //    {
               //    var previousValue;
               //    if (Lang.IsObject(previousAgentValueFromPropertyName)
               //          && Lang.IsMeaningful(previousValue = previousAgentValueFromPropertyName[kName]))
               //       {
               //       value = previousValue;
               //       }
               //    }
               self_.Log('+note: ' + kName, value);
               self_.WriteNote(kName, value);
               break;
            
            case 'PANEL':
               var color = Lang.GetDarkRainbowColorFromAnyP(eArguments[0]);
               selectedRange.setBackground(color)
                    .setBorder(true, true, true, true, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
               break;

            case 'VALIDATE':
               if (Lang.IsValueContainedInSetP('IS_GMAIL_LABEL', eArgumentSet))
                  {
                  selectedRange.setDataValidation(
                        SpreadsheetApp.newDataValidation()
                              .requireValueInList(
                                    GmailApp.getUserLabels().map(function (eLabel) { return eLabel.getName() }).sort()
                                    )
                              .setHelpText(eArguments[0])
                              .build()
                        );
                  }
               break;
            
            case 'REM':
               console.log('REM ' + eArguments.join('\n'));
               break;

            case 'TOAST':
               spreadsheet.toast(eArguments.join('\n'));
               break;

            case 'BG':
               selectedRange.setBackground(eArguments[0]);
               break;

            case 'FG':
               selectedRange.setFontColor(eArguments[0]);
               break;

            case 'FONT':
               selectedRange.setFontFamily(eArguments[0]);
               break;

            case 'HALIGN':
               selectedRange.setHorizontalAlignment(eArguments[0]);
               break;

            case 'VALIGN':
               selectedRange.setVerticalAlignment(eArguments[0]);
               break;

            } // switch agent instruction
         } // for each agent instruction

         return self_; // if we rebooted, this might change
      };


/*************************************************************************************************************************************
**********     ******   *****   *            *        ***   *****   *            *****************************************************
********   ****   ***   *****   ******   *****   ****   *   *****   ******   *********************************************************
******   ********   *   *****   ******   *****   ****   *   *****   ******   *********************************************************
******   ********   *   *****   ******   *****        ***   *****   ******   *********************************************************
******   ********   *   *****   ******   *****   ********   *****   ******   *********************************************************
********   *****   **   *****   ******   *****   ********   *****   ******   *********************************************************
**********     ********      *********   *****   **********      *********   *********************************************************
*************************************************************************************************************************************/



//------------------------------------------------------------------------------------------------------------------------------------
//
// We can tell if this is a Platycore Agent if it has a
// checkbox with a note in cell A1. If the checkbox is
// checked, that means it is okay to evaluate the note
// in order to boot an Agent.
//
// The number of rows merged into A1 determine the
// reserved area of the agent, below which is where the
// output is logged.
//

   this.Preboot = function ()
      {
      var range = sheet_.getRange('A1');

      var note = null;
      if (range.isPartOfMerge())
         {
         irNewMessage_ = 1 + range.getMergedRanges()[0].getNumRows();
         }
      if (true === range.isChecked())
         {
         note = range.getNote();
         }
      if (Lang.IsMeaningful(note))
         {
         try
            {
            self_.ExecuteRoutineFromText(note);
            isThisPrebooted_ = true;
            }
         catch (e)
            {
            if (Platycore.Verbose)
               {
               console.warn("Exception while running preboot script for " + kAgentId_, e, e.stack);
               }
            }
         }

      return isThisPrebooted_;
      };

//------------------------------------------------------------------------------------------------------------------------------------


   }
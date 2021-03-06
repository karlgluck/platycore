
function AgentConnection ()
   {
   
   var self_ = this;

   var kAgentId_ = null;
   var isThisOn_ = false;
   var spreadsheet_ = null;
   var irNewMessage_ = 2;
   var sheet_ = null;

//------------------------------------------------------------------------------------------------------------------------------------
// If WhatIf is truthy, the AgentConnection avoids
// operations that change program state. If the
// agent has an EN property, WhatIf is set to !EN
// during TURN_ON.

   this.WhatIf = false;

//------------------------------------------------------------------------------------------------------------------------------------

   this.Connect = function (identifier)
      {
      var rvConnected = false;
      if (Lang.IsUrlP(identifier))
         {
         rvConnected = self_.ConnectUsingUrl(identifier);
         }
      else if (Lang.IsStringP(identifier))
         {
         rvConnected = self_.ConnectUsingAgentId(identifier)
               || self_.ConnectUsingSheetName(identifier);
         }
      else if (Lang.IsNumberP(identifier))
         {
         rvConnected = self_.ConnectUsingSheetId(identifier);
         }
      else if (Lang.IsObjectP(identifier))
         {
         rvConnected = self_.ConnectUsingSheet(identifier);
         }
      return rvConnected;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ConnectUsingAgentId = function (agentId)
      {
      var rvConnected = false;
      if (agentId.match(/^A\d+$/))
         {
         rvConnected = self_.ConnectUsingSheetId(Lang.MakeIntUsingAnyP(sheet.slice(1)));
         }
      return rvConnected;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ConnectUsingSheetName = function (sheetName)
      {
      return self_.ConnectUsingSheet(SpreadsheetApp.getActive().getSheetByName(sheetName));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ConnectUsingUrl = function (sheetUrl)
      {
      return self_.ConnectUsingSheet(GAS.OpenSheetUsingUrl(sheetUrl));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ConnectUsingSheetId = function (sheetId)
      {
      return self_.ConnectUsingSheet(GAS.OpenSheetUsingSheetId(sheet));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ConnectUsingActiveSheet = function ()
      {
      return self_.ConnectUsingSheet(SpreadsheetApp.getActiveSheet());
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ConnectUsingSheet = function (sheet)
      {
      var rvIsConnected = false;

      kAgentId_ = null;
      isThisOn_ = false;
      spreadsheet_ = null;
      irNewMessage_ = 2;
      readonlyNames_ = [];
      sheet_ = null;

      if (Lang.IsObjectP(sheet))
         {
         sheet_ = sheet;
         kAgentId_ = 'A'+sheet.getSheetId();
         spreadsheet_ = sheet.getParent();

         var range = sheet.getRange('A1');
         if (range.isPartOfMerge())
            {
            irNewMessage_ = 1 + range.getMergedRanges()[0].getNumRows();
            }
         var isChecked = range.isChecked();
         if (false === isChecked)   // all connection while unchecked ONLY if the user
            {                       // is interactively running this agent specifically
            isChecked = Platycore.IsInteractive && !Platycore.IsMainLoop;
            }
         rvIsConnected = true === isChecked && Lang.IsMeaningfulP(range.getNote());
         }

      if (!rvIsConnected)
         {
         sheet_ = null;
         kAgentId_ = null;
         spreadsheet_ = null;
         }

      return rvIsConnected;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.IsConnected = function ()
      {
      return null !== sheet_;
      };

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
**********   *****   *****   ***         *****   ****   ***   ****      *********       ****   ******   *****************************
*******   ***   **   *****   ***   ********   ***   *   **   *****  ****   *****   ****   ****   ***   *******************************
******   *********   *****   ***   *******   ********   *   ******  *****   **   ********   ***   *   ********************************
******   *********       *   ***       ***   ********  *  ********        ***   ********   *****   **********************************
******   *********   *****   ***   *******   ********   **   *****  *****   **   ********   ***   *   ********************************
*******   ***   **   *****   ***   ********   ***   *   ***   ****  ******  ****   ****    ***   ***   *******************************
*********     ****   *****   ***         ****     ***   *****   **        *******       ****   ******   *****************************
*************************************************************************************************************************************/


//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadCheckbox = function (name)
      {
      var range = getRangeFromPropertyName(name);
      return Lang.IsObjectP(range) ? range.isChecked() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteCheckbox = function (name, any)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObjectP(range))
         {
         any = Lang.MakeBoolUsingAnyP(any);
         if (range.getFormula().length > 0)
            {
            range.setFormula(any ? '=TRUE' : '=FALSE');
            }
         else
            {
            if (any) range.check(); else range.uncheck();
            }
         }
      else 
         {
         self_.Warn('WriteCheckbox(name="'+name+'",any='+any+'): name does not exist');
         }
      };


/*************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
*************************************************************************************************************************************/


//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadValue = function (name)
      {
      var range = getRangeFromPropertyName(name);
      return Lang.IsObjectP(range) ? range.getValue() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteValue = function (name, any)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObjectP(range))
         {
         range.setValue(any);
         }
      else 
         {
         self_.Warn('WriteValue(name="'+name+'",any='+any+'): name does not exist');
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
      return Lang.IsObjectP(range) ? range.getNote() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteNote = function (name, any)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObjectP(range))
         {
         range.setNote(Lang.MakeStringUsingAnyP(any));
         }
      else 
         {
         self_.Warn('WriteNote(name="'+name+'",any='+any+'): name does not exist');
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------
// 
// "Find" is used rather than "Get" to convey the higher
// cost of invoking this function.
//

   this.FindNameUsingRangeP = function (range)
      {
      if (Lang.IsNotObjectP(range))
         {
         return null;
         }

      var searchRow = range.getRow();
      var searchColumn = range.getColumn();
      var searchWidth = range.getWidth();
      var searchHeight = range.getHeight();

      var namedRanges = sheet_.getNamedRanges();
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
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
**************************************************************************************************************************************
*************************************************************************************************************************************/

   this.ClearOutput = function ()
      {
      var irFirstRowToDelete = irNewMessage_ + 1;
      sheet_.insertRowsBefore(irNewMessage_, 1);
      sheet_.deleteRows(irFirstRowToDelete, sheet_.getMaxRows() - irFirstRowToDelete + 1);
      };

//------------------------------------------------------------------------------------------------------------------------------------

   var writeOutputFirstTime_ = function (badge, args)
      {
      if (Lang.IsNotMeaningfulP(badge))
         {
         badge = Lang.GetClockFromDateP(new Date());
         }
      sheet_.insertRowsBefore(irNewMessage_, 1);
      var rvRange = writeOutputNormal_(badge, args);
      sheet_.getRange(rvRange.getRow() + 1, 1, 1, 49)
            .setBorder(true, false, false, false, false, false, '#b7b7b7', SpreadsheetApp.BorderStyle.SOLID_THICK);
      writeOutput_ = writeOutputNormal_;
      return rvRange;
      };

//------------------------------------------------------------------------------------------------------------------------------------

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
      notes[0] = new Date().toLocaleString() + '\n\n' + Lang.GetStackTraceP(4) + '\n\n' + Object.keys(args).map(function (kArg){return args[kArg]}).join('\n\n');
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

   this.InteractiveLog = function ()
      {
      if (Platycore.IsInteractive) self_.Log.apply(self_, arguments);
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.LogWithBadge = function (badge, message)
      {
      console.log.apply(console, arguments);
      writeOutput_(badge, [Array(arguments).slice(1)]).setFontColor('#b7b7b7').setBackground('black');
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

   this.InteractiveInfo = function ()
      {
      if (Platycore.IsInteractive) self_.Info.apply(self_, arguments);
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

   this.InteractiveWarn = function ()
      {
      if (Platycore.IsInteractive) self_.Warn.apply(self_, arguments);
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

   this.InteractiveError = function ()
      {
      if (Platycore.IsInteractive) self_.Error.apply(self_, arguments);
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

   this.Uninstall = function ()
      {
      sheet_.getNamedRanges().forEach(function (eRange)
         {
         eRange.remove();
         });
      spreadsheet_.deleteSheet(sheet_);
      self_.ConnectUsingSheet(null);
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.TurnOn = function ()
      {
      if (isThisOn_)
         {
         return true;
         }
      var isAlreadyRunning = self_.ReadCheckbox('ON');
      var lockValue = self_.ReadValue('LOCK');
      var hasLockValue = Lang.IsNotUndefinedP(lockValue);
      if (hasLockValue)
         {
         lockValue = Lang.MakeIntUsingAnyP(lockValue);
         var lockValueWithSentinel = (lockValue - (lockValue % 1000)) + (((lockValue % 1000) + 1) % 1000);
         self_.WriteValue('LOCK', lockValueWithSentinel);
         var canOverrideLock = Platycore.PumpRuntimeLimit < (Lang.GetTimestampNowP() - lockValue);
         }
      else
         {
         var lockValueWithSentinel = null;
         var canOverrideLock = false;
         }

      var canTurnOn = !isAlreadyRunning || (hasLockValue && canOverrideLock);
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
               isAlreadyRunning = Lang.MakeBoolUsingAnyP(self_.ReadCheckbox('ON'));
               if (hasLockValue)
                  {
                  canTurnOn = self_.ReadValue('LOCK') === lockValueWithSentinel
                        && (!isAlreadyRunning || canOverrideLock);
                  }
               else
                  {
                  canTurnOn = !isAlreadyRunning;
                  }

            if (canTurnOn)
               {
               self_.WriteValue('LOCK', Lang.GetTimestampNowP());
               self_.WriteCheckbox('ON', true);
               GAS.LimitAndTrimSheetRows(sheet_,  irNewMessage_ + Platycore.MaximumAgentLogRows);
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

      isThisOn_ = false;

      if (Lang.IsObjectP(sheet_))
         {
         var lock = LockService.getDocumentLock();
         if (lock.tryLock(Platycore.DocumentTryLockWaitTime))
            {
            try
               {
               self_.WriteCheckbox('ON', false);
               }
            finally
               {
               lock.releaseLock();
               lock = null;
               }
            }
         }

      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Execute the routine that defines this agent in A1
//

   this.ExecuteRoutineUsingA1Note = function ()
      {
      return this.ExecuteRoutineUsingText(sheet_.getRange(1,1).getNote());
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Execute the routine in the note named
//

   this.ExecuteRoutineUsingNoteName = function (noteName)
      {
      if (!isThisOn_)
         {
         throw "!isThisOn_";
         }

      var routine = self_.ReadNote(noteName);
      if (Lang.IsUndefinedP(routine))
         {
         self_.Error('There is no note with the given name: ' + noteName);
         return null;
         }

      return this.ExecuteRoutineUsingText(routine);
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
         var rv = null;
         try
            {
            rv = eval(codeLines
                  .map(function (e, i) { return e.replace(/;\s$/,';lineNumber='+(i+1)+';'); })
                  .join('\n'));
            }
         catch (e)
            {
            self_.Error((sourceLabel || '[eval]')
                  + '(~' + lineNumber + '): ' + (e.message || e.toString()) + '\n\n'
                  + codeLines
                        .map(function (e, i) { return Lang.MakeStringWithLeadingZeroesUsingNumberP(i, 4) + ': ' + e; })
                        .slice(
                        Math.max(lineNumber-2,0),
                        Math.min(codeLines.length-1,lineNumber+3)
                        )
                        .join('\n')
                  + '\n\n'
                  + (Lang.IsUndefinedP(e.stack) ? '     no stack trace' : e.stack)
                  );
            }
         finally
            {
            return rv;
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
// the agent can still be woken up in other ways.
//
// There are basically no guarantees about the amount of time snoozing
// actually puts the agent to sleep... but "rest" assured that it does
// ...something like what you would expect, but with some asterisks.
//
// One thing's for sure, though: if you require regular execution intervals,
// do NOT rely on Snooze to provide them.
//

//------------------------------------------------------------------------------------------------------------------------------------

   this.Snooze = function (dtMilliseconds)
      {
      var utsNow = Lang.GetTimestampNowP();
      dtMilliseconds = Math.max(15000, dtMilliseconds);
      var maybePreviousWakeTime = self_.ReadValue('WAKE');
      var utsNewWakeTime = utsNow + dtMilliseconds;
      if (Lang.IsNumberP(maybePreviousWakeTime))
         {
         maybePreviousWakeTime = Lang.MakeIntUsingAnyP(maybePreviousWakeTime);
         if (maybePreviousWakeTime < utsNow && maybePreviousWakeTime > (utsNow - dtMilliseconds))
            {
            utsNewWakeTime = maybePreviousWakeTime + dtMilliseconds;
            }
         }
      self_.WriteValue('WAKE', utsNewWakeTime); // note the lack of protection for only incrementing or decrementing this value. It just does whatever!
      self_.InteractiveLog(
            Lang.GetMoonPhaseP() + ' snoozing for ' + Lang.MakeStopwatchStringUsingMillis(dtMilliseconds) + ' until ' + Lang.MakeStopwatchStringUsingMillis(utsNewWakeTime - Lang.GetTimestampNowP()) + ' from now at ' + Lang.MakeWallTimeStringUsingTimestampP(utsNewWakeTime)
            );
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.SnoozeUntilDate = function (date)
      {
      var utsWakeTime = date.getTime();
      self_.WriteValue('WAKE', utsWakeTime);
      self_.InteractiveLog(Lang.GetMoonPhaseP() + ' snoozing until ' + date);
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.SnoozeForever = function ()
      {
      self_.InteractiveLog(Lang.GetMoonPhaseP() + ' snoozing, no alarm... ');
      self_.WriteValue('WAKE', 'SNOOZE');
      };

//------------------------------------------------------------------------------------------------------------------------------------

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
      if (Platycore.IsVerbose)
         {
         self_.Info('Fetching ' + Lang.ClampStringLengthP(urlAgentInstructions, 50));
         }
      return self_.ExecuteRoutineUsingText(getRoutineTextFromUrl(urlAgentInstructions));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   var makeRoutineUsingText = function (agentInstructionsText)
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
               var match = /^\s+</.exec(group);
               if (Lang.IsArrayP(match))
                  {
                  group = group
                        .substring(1)
                        .split('\n')
                        .map((function (qCharactersToTrim)
                           {
                           return eLine => eLine.substring(qCharactersToTrim)
                           })(match[0].length-1))
                        .join('\n')
                        ;
                  }
               return JSON.stringify(group);
               })
            .split(/\n/)
            .filter(function (eLine)   // strip every line that doesn't start with whitespace
               {
               return eLine.trim().length > 0 && Lang.MakeBoolUsingAnyP(whitespaceRegex.exec(eLine))
               })
            .map(function (eLine)      // take the first token and the rest of the line as 2 elements
               {
               var match = associativeSplitRegex.exec(eLine);
               if (Lang.IsArrayP(match))
                  {
                  return match.slice(1);
                  }
               else
                  {
                  self_.InteractiveWarn('invalid line: ' + eLine);
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
      self_.InteractiveLog('agentInstructionsText', agentInstructionsText);
      return JSON.parse(agentInstructionsText);
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ExecuteRoutineUsingText = function (agentInstructionsText)
      {
      var routine = makeRoutineUsingText(agentInstructionsText);
      return self_.ExecuteRoutineUsingInstructions(routine);
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Runs a routine. Routines are diferent from scripts in
// while scripts contain Javascript code, Routines contain
// a list of assembly-like instructions. This provides a
// generic text interace for manipulating the structure of
// the agent in the same way that Platycore does.
//

   this.ExecuteRoutineUsingInstructions = function (instructions)
      {
      if (Lang.IsNotArrayP(instructions)) throw "Lang.IsNotArrayP(instructions)";

      var rvExecutionDetails = {
            didAbort: false,
            didTurnOn: false
            };

      var isDebugging = false;
      var selectedRange = null;
      var mergingInstructionsSet = Lang.MakeSetUsingObjectsP(['FORMULA', 'CHECKBOX', 'EVALUE', 'VALUE', 'NOTE', 'VALUE', 'LOAD']);
      var hasMergedCurrentSelection = false;
      var lastInstallUrl = null;
      var selectionTypeInstructionsSet = Lang.MakeSetUsingObjectsP(['CHECKBOX', 'VALUE', 'NOTE']);
      var selectionTypeInstruction = 'NONE';
      var sheetFromAlias = {};
      var kSelectedRangePropertyName = null;
      var currentAgentAlias = null;
      var stackValues = [];
      var importedValueFromPropertyNameFromAlias = {};

      var writeSelectionFunctionFromTypeName = {
         'NONE': function () {},
         'NOTE': self_.WriteNote,
         'VALUE': self_.WriteValue,
         'CHECKBOX': self_.WriteCheckbox,
         'STACK': ((name, value) => stackValues.push(value))
      };
      
      for (var iInstruction = 1, nInstructionCount = instructions.length; iInstruction < nInstructionCount; iInstruction += 2)
         {
         var eInstruction = instructions[iInstruction - 1];
         var eArguments   = instructions[iInstruction - 0];
         var eArgumentSet = Lang.MakeSetUsingObjectsP(eArguments);

         if (!hasMergedCurrentSelection && Lang.IsContainedInSetP(eInstruction, mergingInstructionsSet) && null != selectedRange)
            {
            switch (((selectedRange.getWidth() > 1) ? 1 : 0) + ((selectedRange.getHeight() > 1) ? 2 : 0))
               {
               case 1: /* w   */ selectedRange.mergeAcross(); break;
               case 2: /* h   */ selectedRange.mergeVertically(); break;
               case 3: /* w+h */ selectedRange.merge(); break;
               }
            hasMergedCurrentSelection = true;
            }
         if (Lang.IsContainedInSetP(eInstruction, selectionTypeInstructionsSet))
            {
            selectionTypeInstruction = eInstruction;
            }
         if ('STACK' !== selectionTypeInstruction && Lang.IsNotObjectP(selectedRange))
            {
            selectionTypeInstruction = 'NONE';
            }

         (isDebugging ? self_.Log : console.log)('OUT:' + selectionTypeInstruction + ';RANGE:' + (Lang.IsObjectP(selectedRange) ? selectedRange.getA1Notation() : 'null') + '  ' + eInstruction + JSON.stringify(eArguments));
         var writeSelection = function (any)
            {
            if (isDebugging) self_.Log('write ' + kSelectedRangePropertyName + ' = ' + Lang.MakeStringUsingAnyP(any));
            writeSelectionFunctionFromTypeName[selectionTypeInstruction](kSelectedRangePropertyName, any);
            };

         var popArgument = function (castFunction = null)
            {
            var rv = undefined;
            if (eArguments.length > 0)
               {
               rv = eArguments.shift();
               if (null === rv)
                  {
                  if (stackValues.length > 0)
                     {
                     rv = stackValues.shift();
                     if (isDebugging) self_.Log('popArgument used stack value ' + JSON.stringify(rv));
                     }
                  }
               }
            if (Lang.IsNotUndefinedP(rv) && null != castFunction)
               {
               rv = castFunction(rv);
               }
            return rv;
            };

         switch (eInstruction)
            {
            default:
               self_.Error('invalid instruction', eInstruction);
               break;

            case 'DEBUG':     isDebugging = popArgument(Lang.IsAffirmativeStringP); break;
            case 'TURN_OFF':  self_.TurnOff(); break;
            case 'UNINSTALL': self_.Uninstall(); break;
            case 'INFO':      self_.Info(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'WARN':      self_.Warn(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'ERROR':     self_.Error(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'CLS':       self_.ClearOutput(); break;
            case 'CLEAR':     selectedRange.clear(); break;
            case 'NOTE':      selectedRange.setNote(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'FORMULA':   selectedRange.setFormula(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'VALUE':     selectedRange.setValue(popArgument()); break;
            case 'PUSH':      stackValues.push(popArgument()); break;
            case 'REM':       self_.InteractiveInfo(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'TOAST':     spreadsheet_.toast(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'BG':        selectedRange.setBackground(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'FG':        selectedRange.setFontColor(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'FONT':      selectedRange.setFontFamily(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'HALIGN':    selectedRange.setHorizontalAlignment(popArgument(Lang.MakeStringUsingAnyP)); break;
            case 'VALIGN':    selectedRange.setVerticalAlignment(popArgument(Lang.MakeStringUsingAnyP)); break;

            case 'EVALUE': // combination of EVAL + VALUE
               selectedRange.setValue(self_.EvalCode(popArgument(Lang.MakeStringUsingAnyP), 'EVALUE@'+iInstruction));
               break;

            case 'EVAL': // run the code
               self_.EvalCode(popArgument(Lang.MakeStringUsingAnyP), 'EVAL@'+iInstruction);                  
               break;

            case 'ALIAS':
               (function (kAlias)
                  {
                  currentAgentAlias = kAlias;
                  sheetFromAlias[kAlias] = sheet_;
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'TITLE':
               (function (title)
                  {
                  sheet_.setName(Lang.MakeNameUniqueP('🧚 ' + title, n => null === spreadsheet_.getSheetByName(n)));
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'TURN_ON':
               if (!self_.TurnOn())
                  {
                  self_.InteractiveError('Unable to turn on');
                  rvExecutionDetails.didAbort = true;
                  nInstructionCount = 0;
                  }
               else
                  {
                  rvExecutionDetails.didTurnOn = true;
                  if (self_.WhatIf)
                     {
                     self_.InteractiveLog('[WhatIf]: Agent is disabled (to enable, set EN=TRUE)');
                     }
                  }
               break;
            
            case 'ENTER_WHAT_IF_MODE_UNLESS':
               (function (kName)
                  {
                  self_.WhatIf = false === self_.ReadCheckbox(kName);
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'NAME':
               (function (kName)
                  {
                  kSelectedRangePropertyName = kName;
                  spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kSelectedRangePropertyName), selectedRange);
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'CODE':
               (function (code)
                  {
                  var value = '  TURN_ON\n  EVAL "---"\n--------\n   <' + code.replace(/\n/g, /\n   /) + '\n--------\n  TURN_OFF';
                  selectedRange.setNote(value);
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'ABORT_UNLESS_INTERACTIVE':
               if (!Platycore.IsInteractive)
                  {
                  rvExecutionDetails.didAbort = true;
                  nInstructionCount = 0;
                  }
               break;
            
            case 'ABORT_UNLESS_ACTIVATED':
               (function ()
                  {
                  var isActivated = Platycore.IsMainLoop ? false : Platycore.IsInteractive;
                  if (!isActivated)
                     {
                     var isEnabled = (function (en) { return Lang.IsUndefinedP(en) || Lang.MakeBoolUsingAnyP(en) })(self_.ReadCheckbox('EN'));
                     var isGo = isEnabled && (function (go) { return Lang.IsNotUndefinedP(go) && Lang.MakeBoolUsingAnyP(go) })(self_.ReadCheckbox('GO'));
                     var isWake = isEnabled && !isGo && (function (wake) { return Lang.IsNumberP(wake) && Lang.GetTimestampNowP() > wake })(self_.ReadValue('WAKE'));
                     isActivated = isGo || isWake;
                     if (isGo)
                        {
                        self_.WriteCheckbox('GO', false);
                        }
                     }
                  if (!isActivated)
                     {
                     rvExecutionDetails.didAbort = true;
                     nInstructionCount = 0;
                     }
                  })();
               break;

            case 'FORMAT':
               (function (format)
                  {
                  switch (format)
                     {
                     case 'DATETIME': selectedRange.setNumberFormat('M/d/yyyy H:mm:ss'); break;
                     case 'CHECKBOX': selectedRange.setNumberFormat('"☑";"☐"'); break;
                     default: selectedRange.setNumberFormat(format); break;
                     }
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'INSTALL':
               (function (installUrl)
                  {
                  isThisOn_ = true;
                  lastInstallUrl = installUrl;
                  try
                     {
                     var iNextInstruction = iInstruction + 1;
                     var routineToInstall = makeRoutineUsingText(getRoutineTextFromUrl(lastInstallUrl));
                     if (isDebugging) self_.Log('routineToInstall = ' + JSON.stringify(routineToInstall));
                     instructions = instructions.slice(0, iNextInstruction).concat(routineToInstall, instructions.slice(iNextInstruction));
                     nInstructionCount = instructions.length;
                     }
                  catch (e)
                     {
                     self_.Error('Unable to INSTALL:' + String(e), e.stack);
                     rvExecutionDetails.didAbort = true;
                     nInstructionCount = 0;
                     }
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'NEW_AGENT':
               (function (kAlias)
                  {
                  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
                  sheet.getRange('A1').insertCheckboxes().check().setNote('  REM "NEW_AGENT"');
                  if (!self_.ConnectUsingSheet(sheet))
                     {
                     self_.Error('NEW_AGENT: failed to connect');
                     rvExecutionDetails.didAbort = true;
                     nInstructionCount = 0;
                     }
                  sheetFromAlias[kAlias] = sheet;
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'CONNECT':
               (function (identifier)
                  {
                  var didConnect = false;
                  if (sheetFromAlias.hasOwnProperty(identifier))
                     {
                     didConnect = self.ConnectUsingSheet(sheetFromAlias[identifier]);
                     }
                  else
                     {
                     didConnect = self.Connect(identifier);
                     }
                  if (!didConnect)
                     {
                     self_.Error('CONNECT: Unable to connect to "' + identifier + '"');
                     rvExecutionDetails.didAbort = true;
                     nInstructionCount = 0;
                     }
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;
            
            case 'EXPORT':
               (function ()
                  {
                  if (Lang.IsNotStringP(currentAgentAlias))
                     {
                     self_.Error("Cannot EXPORT until the current agent connection is named with ALIAS");
                     return;
                     }
                  var valueFromPropertyName = {
                        '$AGENT_ID': kAgentId_
                        };
                  var qPrefixLength = getRangeNameFromPropertyName('').length;
                  sheet_.getNamedRanges().forEach(function (eRange)
                     {
                     var range = eRange.getRange();
                     var formulaValue = range.getFormula();
                     var noteValue = range.getNote();
                     valueFromPropertyName[eRange.getName().substring(qPrefixLength)]
                           = Lang.IsMeaningfulP(noteValue) ? noteValue : (Lang.IsMeaningfulP(formulaValue) ? formulaValue : range.getValue());
                     });
                  if (isDebugging) self_.Log('EXPORT ' + JSON.stringify(valueFromPropertyName))
                  importedValueFromPropertyNameFromAlias[currentAgentAlias] = valueFromPropertyName;
                  })();
               break;

            case 'STYLE':
               (function (styleType)
                  {
                  switch (styleType)
                     {

                     default:
                        self_.Error('Unknown STYLE type: ' + styleType);
                        break;

                     case 'BUTTON': 
                        selectedRange
                              .setFontColor('#000')
                              .setBackground('#ffff00')
                              .setHorizontalAlignment('center')
                              ;
                        break;

                     case 'FIELD':
                        selectedRange
                              .setTextStyle(
                                    selectedRange
                                          .getTextStyle()
                                          .copy()
                                          .setForegroundColor('#00ffff')
                                          .setUnderline(true)
                                          .build()
                                    )
                              .setBackground('#1c4587')
                              ;

                        break;

                     case 'READONLY_FIELD':
                        selectedRange
                              .setTextStyle(
                                    selectedRange
                                          .getTextStyle()
                                          .copy()
                                          .setForegroundColor('#666666')
                                          .setUnderline(false)
                                          .build()
                                    )
                              .setBackground('#1c4587')
                              ;

                        break;
                     }
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'RESERVE':
               (function (qrRows)
                  {
                  var mrMaxRows = sheet_.getMaxRows();
                  var mrMaxColumns = sheet_.getMaxColumns();
                  sheet_.getRange(1, 1, mrMaxRows, mrMaxColumns)
                        .setFontColor('#b7b7b7')
                        .setBackground('black')
                        .setFontFamily('IBM Plex Mono')
                        .setVerticalAlignment('top')
                        .setWrap(false)
                        .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
                        ;

                  sheet_.setRowHeights(1, mrMaxRows, 21);
                  sheet_.setColumnWidths(1, sheet_.getMaxColumns(), 21); // square the cells

                  var qcExtraColumns = mrMaxColumns - 49;
                  if (qcExtraColumns < 0)
                     {
                     sheet_.insertColumnsAfter(Math.max(1, sheet_.getMaxColumns()), -qcExtraColumns);
                     }
                  else if (qcExtraColumns > 0)
                     {
                     sheet_.deleteColumns(mrMaxColumns - qcExtraColumns + 1, qcExtraColumns);
                     }
                  mrMaxColumns = 49;

                  var irHeaders = qrRows;
                  sheet_.insertRowsBefore(irNewMessage_, qrRows);
                  mrMaxRows += qrRows;
                  irNewMessage_ = qrRows + 1;
                  var irFirstRowToDelete = Math.max(irHeaders + 2, sheet_.getLastRow() + 1);
                  sheet_.deleteRows(irFirstRowToDelete, mrMaxRows - irFirstRowToDelete + 1);
                  mrMaxRows = irFirstRowToDelete - 1;

                  sheet_.getRange(qrRows, 1, 1, mrMaxColumns).setBorder(false, false, true, false, false, false, '#b7b7b7', SpreadsheetApp.BorderStyle.SOLID_THICK);
                  sheet_.getRange(1, 1, qrRows, 1).mergeVertically().setBackground('#b7b7b7').setFontColor('#000000');
                  var logRange = sheet_.getRange(qrRows, 1, mrMaxRows-qrRows+1, sheet_.getMaxColumns());
                  logRange.setWrap(false).setWrapStrategy(SpreadsheetApp.WrapStrategy.OVERFLOW);
                  })(popArgument(Lang.MakeIntUsingAnyP));
               break;

            case 'SELECT':
               (function (rangeIdentifier)
                  {
                  hasMergedCurrentSelection = false;
                  selectedRange = null;
                  if ('STACK' === rangeIdentifier)
                     {
                     selectionTypeInstruction = 'STACK';
                     }
                  else
                     {
                     try
                        {
                        selectedRange = sheet_.getRange(rangeIdentifier);
                        if (isDebugging) self_.Log('getRange named "' + rangeIdentifier + '" = > RANGE=' + GAS.FindDescriptiveNameOfRange(selectedRange));
                        }
                     catch (e)
                        {
                        selectedRange = getRangeFromPropertyName(rangeIdentifier);
                        if (isDebugging) self_.Log('SELECT property named "' + rangeIdentifier + '" = > RANGE=' + GAS.FindDescriptiveNameOfRange(selectedRange));
                        }
                     selectionTypeInstruction = 'VALUE';
                     }
                  kSelectedRangePropertyName = self_.FindNameUsingRangeP(selectedRange);
                  })(popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'CHECKBOX':
               (function (value, isReadonly)
                  {
                  
                  if (isReadonly)
                     {
                     selectedRange
                        .insertCheckboxes()
                        .setFontColor('#666666')
                        .setFormula(value ? '=TRUE' : '=FALSE')
                        ;
                     }
                  else
                     {
                     selectedRange
                        .insertCheckboxes()
                        .setFontColor('#00ffff')
                        .setValue(value)
                        ;
                     }
                  })(popArgument(Lang.IsAffirmativeStringP), Lang.IsContainedInSetP('READONLY', eArgumentSet));
               break;

            case 'LOAD':
               (function (propertyName, kAlias)
                  {
                  if (Lang.IsNotStringP(propertyName))
                     {
                     self_.Error('LOAD: missing propertyName');
                     }
                  else if (Lang.IsUndefinedP(kAlias))
                     {
                     if (GAS.IsValidRangeNameP(propertyName))
                        {
                        var range = getRangeFromPropertyName(propertyName);
                        if (Lang.IsObjectP(range))
                           {
                           writeSelection(range.getValue());
                           }
                        else
                           {
                           self_.Warn('LOAD: no property named "' + propertyName + '" in the current agent; skipping');
                           }
                        }
                     else
                        {
                        switch (propertyName)
                           {
                           case '$AGENT_ID':
                              writeSelection(kAgentId_);
                              break;

                           case '$LAST_INSTALL_URL':
                              writeSelection(lastInstallUrl);
                              break;

                           case '$NOW':
                              writeSelection(new Date());
                              break;

                           default:
                              self_.Error('LOAD requested an unknown value: "' + value + '"');
                              break;
                           }
                        }
                     }
                  else if (importedValueFromPropertyNameFromAlias.hasOwnProperty(kAlias))
                     {
                     var importedValueFromPropertyName = importedValueFromPropertyNameFromAlias[kAlias];
                     var previousValue = null;
                     if (Lang.IsObjectP(importedValueFromPropertyName)
                           && Lang.IsMeaningfulP(previousValue = importedValueFromPropertyName[propertyName]))
                        {
                        writeSelection(previousValue);
                        }
                     else
                        {
                        self_.Warn('LOAD: no property named "' + propertyName + '" in "' + kAlias + '"; skipping');
                        }
                     }
                  else
                     {
                     if (isDebugging)
                        {
                        self_.Warn('LOAD: "' + kAlias + '" is not available');
                        }
                     }
                  })(popArgument(Lang.MakeStringUsingAnyP), popArgument(Lang.MakeStringUsingAnyP));
               break;

            case 'VALIDATE':
               (function (helpText, validationType)
                  {
                  switch (validationType)
                     {
                     case 'IS_GMAIL_LABEL':
                        selectedRange.setDataValidation(
                              SpreadsheetApp.newDataValidation()
                                    .requireValueInList(
                                          GmailApp.getUserLabels().map(function (eLabel) { return eLabel.getName() }).sort()
                                          )
                                    .setHelpText(helpText)
                                    .build()
                              );
                        break;

                     case 'IS_URL':
                        selectedRange.setDataValidation(
                              SpreadsheetApp.newDataValidation()
                                    .requireTextIsUrl()
                                    .setHelpText(helpText)
                                    .build()
                              );
                        break;

                     default:
                        self_.Error('Unknown VALIDATE requested: ' + validationType);
                        break;
                     }
                  })(popArgument(Lang.MakeStringUsingAnyP), popArgument(Lang.MakeStringUsingAnyP));

               break;

            } // switch agent instruction
         } // for each agent instruction

         return rvExecutionDetails;
      };


//------------------------------------------------------------------------------------------------------------------------------------

   this.ProcessEachNewObjectFromSheet = function (sheet, callbackForEachObject)
      {
      var headerForThisAgent = '__' + kAgentId_.toLowerCase();
      var table = GAS.MakeTableUsingSheetP(sheet);
      var allObjects = Lang.MakeObjectsUsingTableP(table);
      var headers = Lang.GetHeadersFromTableP(table);
      var [oldObjects, newObjects] = Lang.SplitArrayP(allObjects, (e) => Lang.MakeBoolUsingAnyP(e[headerForThisAgent]));
      var processedObjects =
         newObjects
         .map(function (eObject)
            {
            var eProcessedObject = callbackForEachObject(eObject);
            return null === eProcessedObject ? null : eObject;
            })
         .filter(Lang.IsNotNullP)
         ;
      if (!self_.WhatIf)
         {
         if (processedObjects.length > 0)
            {
            processedObjects.forEach(function (eObject) { eObject[headerForThisAgent] = true });
            headers = GAS.MergeSheetHeaders(sheet, Object.keys(processedObjects[0]));
            }
         GAS.WriteSheetUsingObjects(sheet, processedObjects.concat(oldObjects), headers);
         }
      return processedObjects;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.OpenSheetUsingUrlFromValue = function (propertyName)
      {
      var url = self_.ReadValue(propertyName);
      var rvSheet = GAS.OpenSheetUsingUrl(url);
      return rvSheet;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.MakeMultimapUsingObjectsInSheetFromValueByMidnightTimestampP = function (propertyName, kDateColumn)
      {
      var url = self_.ReadValue(propertyName);
      var sheet = GAS.OpenSheetUsingUrl(url);
      var objects = GAS.MakeObjectsUsingSheetP(sheet);
      var rvObjectsFromMidnight = Lang.MakeMultimapUsingObjectsByMidnightTimestampP(objects, kDateColumn);
      return rvObjectsFromMidnight;
      };

//------------------------------------------------------------------------------------------------------------------------------------
// If an argument was provided to the constructor, try
// to Connect using it.

   self_.Connect(arguments[0]);

//------------------------------------------------------------------------------------------------------------------------------------

   }
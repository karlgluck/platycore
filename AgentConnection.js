
function AgentConnection ()
   {
   
   var self_ = this;

   var kAgentId_ = null;
   var isThisOn_ = false;
   var spreadsheet_ = null;
   var irNewMessage_ = 2;
   var readonlyNames_ = [];
   var sheet_ = null;

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
         rvConnected = self_.ConnectUsingSheetId(Lang.MakeIntFromAnyP(sheet.slice(1)));
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
      return self_.ConnectUsingSheet(GAS.GetSheetFromUrl(sheetUrl));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ConnectUsingSheetId = function (sheetId)
      {
      return self_.ConnectUsingSheet(GAS.GetSheetFromSheetId(sheet));
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
         rvIsConnected = true === range.isChecked() && Lang.IsMeaningfulP(range.getNote());
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
******            ****     *********     *******     ****   *******         **********************************************************
***********   ******   ****   ****  ****   ***  ****   **   *******   ****************************************************************
***********   ****   ********   *   *********   *********   *******   ****************************************************************
***********   ****   ********   *   *********   *********   *******       ************************************************************
***********   ****   ********   *   ***     *   ***     *   *******   ****************************************************************
***********   ******   *****   ***   ****  ***   ****  **   *******   ****************************************************************
***********   ********     ********      ******      ****         *         **********************************************************
*************************************************************************************************************************************/

//------------------------------------------------------------------------------------------------------------------------------------

   var setToggleReadonly_ = function (range, isReadonly, value)
      {
      if (isReadonly)
         {
         range.setFontColor('#666666').setFormula(value ? '=TRUE' : '=FALSE'); // readonly
         }
      else
         {
         range.setFontColor('#00ffff').setValue(value); // editable
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadToggle = function (name, ignoreCache)
      {
      var range = getRangeFromPropertyName(name);
      return Lang.IsObjectP(range) ? range.isChecked() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteToggle = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObjectP(range))
         {
         value = Lang.MakeBoolFromAnyP(value);
         if (range.getFormula().length > 0)
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

   var setFieldReadonly_ = function (range, isReadonly)
      {
      var textStyleBuilder = range.getTextStyle().copy();
      if (isReadonly)
         {
         textStyleBuilder.setForegroundColor('#666666')
                         .setUnderline(false);
         }
      else
         {
         textStyleBuilder
               .setForegroundColor('#00ffff')
               .setUnderline(true);
         }
      range.setTextStyle(textStyleBuilder.build());
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadField = function (name, ignoreCache)
      {
      var range = getRangeFromPropertyName(name);
      return Lang.IsObjectP(range) ? range.getValue() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteField = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObjectP(range))
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
      return Lang.IsObjectP(range) ? range.getNote() : undefined;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteNote = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObjectP(range))
         {
         range.setNote(Lang.MakeStringFromAnyP(value));
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
      var valueFromPropertyName = {};
      var qPrefixLength = getRangeNameFromPropertyName('').length;
      sheet_.getNamedRanges().forEach(function (eRange)
         {
         var range = eRange.getRange();
         var noteValue = range.getNote();
         valueFromPropertyName[eRange.getName().substring(qPrefixLength)] = Lang.IsMeaningfulP(noteValue) ? noteValue : range.getValue();
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
      var isAlreadyRunning = self_.ReadToggle('ON', true);
      var lockValue = self_.ReadField('LOCK', true);
      var hasLockField = Lang.IsNotUndefinedP(lockValue);
      if (hasLockField)
         {
         lockValue = Lang.MakeIntFromAnyP(lockValue);
         var lockValueWithSentinel = (lockValue - (lockValue % 1000)) + (((lockValue % 1000) + 1) % 1000);
         self_.WriteField('LOCK', lockValueWithSentinel);
         var canOverrideLock = Platycore.PumpRuntimeLimit < (Lang.GetTimestampNowP() - lockValue);
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
               isAlreadyRunning = Lang.MakeBoolFromAnyP(self_.ReadToggle('ON', true));
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
               self_.WriteField('LOCK', Lang.GetTimestampNowP());
               self_.WriteToggle('ON', true);
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
               self_.WriteToggle('ON', false);
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
// Execute the code in the note named by the field SCRIPT,
// given all of these things exist and are valid.
//

   this.Step = function ()
      {
      if (!isThisOn_)
         {
         throw "must be turned on, otherwise the program might not have exclusive control of the agent"
         }

      var update = self_.ReadField('UPDATE');
      if (Lang.IsUndefinedP(update))
         {
         self_.Warn('This agent does not do anything when activated because there is no UPDATE field');
         return;
         }

      var rv = self_.ExecuteRoutineUsingNoteName(update);
      return rv;
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
      var utsNow = Lang.GetTimestampNowP();
      dtMilliseconds = Math.max(15000, dtMilliseconds);
      var maybePreviousWakeTime = self_.ReadField('WAKE');
      var utsNewWakeTime = utsNow + dtMilliseconds;
      if (Lang.IsNumberP(maybePreviousWakeTime))
         {
         maybePreviousWakeTime = Lang.MakeIntFromAnyP(maybePreviousWakeTime);
         if (maybePreviousWakeTime < utsNow && maybePreviousWakeTime > (utsNow - dtMilliseconds))
            {
            utsNewWakeTime = maybePreviousWakeTime + dtMilliseconds;
            }
         }
      self_.WriteField('WAKE', utsNewWakeTime); // note the lack of protection for only incrementing or decrementing this value. It just does whatever!
      self_.LogWithBadge(
            Lang.GetMoonPhaseFromDateP(new Date(utsNewWakeTime)),
            'snoozing for ' + Lang.stopwatchStringFromDuration(dtMilliseconds) + ' until ' + Lang.stopwatchStringFromDuration(utsNewWakeTime - Lang.GetTimestampNowP()) + ' from now at ' + Lang.MakeWallTimeStringUsingTimestampP(utsNewWakeTime)
            );
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.SnoozeForever = function ()
      {
      self_.Log(Lang.GetMoonPhaseFromDateP(Lang.GetTimestampNowP()) + 'Snoozing, no alarm... ');
      self_.WriteField('WAKE', 'SNOOZE');
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
               return eLine.trim().length > 0 && Lang.MakeBoolFromAnyP(whitespaceRegex.exec(eLine))
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
                  if (Platycore.IsVerbose)
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

   this.ExecuteRoutineUsingText = function (agentInstructionsText)
      {
      var routine = getRoutineFromText(agentInstructionsText);
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
            didAbort: false
            };

      var selectedRange = null;
      var mergingInstructionsSet = Lang.MakeSetUsingObjectsP(['FORMULA', 'TOGGLE', 'FIELD', 'TEXT', 'NOTE', 'VALUE']);
      var hasMergedCurrentSelection = false;
      var lastInstallUrl = null;
      var selectionTypeInstructionsSet = Lang.MakeSetUsingObjectsP(['TOGGLE', 'FIELD', 'TEXT', 'NOTE']);
      var selectionTypeInstruction = null;
      var sheetFromAlias = {};
      var kSelectedRangePropertyName = null;
      var currentAgentAlias = null;
      var stackValues = [];
      var importedValueFromPropertyNameFromAlias = {};
      
      for (var iInstruction = 1, nInstructionCount = instructions.length; iInstruction < nInstructionCount; iInstruction += 2)
         {
         var eInstruction = instructions[iInstruction - 1];
         var eArguments   = instructions[iInstruction - 0];
         var eArgumentSet = Lang.MakeSetUsingObjectsP(eArguments);

         if (!hasMergedCurrentSelection && Lang.IsContainedInSetP(eInstruction, mergingInstructionsSet))
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

         console.log(eInstruction);

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
                     }
                  }
               }
            if (Lang.IsNotUndefinedP(rv))
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

            case 'ABORT_UNLESS_INTERACTIVE':
               if (!Platycore.IsInteractive)
                  {
                  rvExecutionDetails.didAbort = true;
                  nInstructionCount = 0;
                  }
               break;
            
            case 'ABORT_UNLESS_TRIGGERED':
               var isEnabled = (function (en) { return Lang.IsUndefinedP(en) || Lang.MakeBoolFromAnyP(en) })(self_.ReadToggle('EN'));
               var isGo = (function (go) { return Lang.IsNotUndefinedP(go) && Lang.MakeBoolFromAnyP(go) })(self_.ReadToggle('GO'));
               var isWake = (function (wake) { return Lang.IsNumberP(wake) && utsIterationStarted > wake })(self_.ReadField('WAKE'));
               var isTriggered = isEnabled && (isGo || isWake);
               if (!isTriggered)
                  {
                  rvExecutionDetails.didAbort = true;
                  nInstructionCount = 0;
                  }
               break;

            case 'INSTALL':
               isThisOn_ = true;
               lastInstallUrl = popArgument(Lang.MakeStringFromAnyP);
               try
                  {
                  instructions = instructions.concat(getRoutineFromText(getRoutineTextFromUrl(lastInstallUrl)));
                  nInstructionCount = instructions.length;
                  }
               catch (e)
                  {
                  self_.Error('Unable to INSTALL:' + String(e), e.stack);
                  rvExecutionDetails.didAbort = true;
                  nInstructionCount = 0;
                  }
               break;

            case 'NEW_AGENT':
               var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
               sheet.getRange('A1').insertCheckboxes().check().setNote('  REM "NEW_AGENT"');
               if (!self_.ConnectUsingSheet(sheet))
                  {
                  self_.Error('NEW_AGENT: Failed to connect to agent');
                  rvExecutionDetails.didAbort = true;
                  nInstructionCount = 0;
                  }
               sheetFromAlias[popArgument(Lang.MakeStringFromAnyP)] = sheet;
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
                  })(popArgument(Lang.MakeStringFromAnyP));
               break;

            case 'ALIAS':
               (function (kAlias)
                  {
                  currentAgentAlias = kAlias;
                  sheetFromAlias[kAlias] = sheet_;
                  })(popArgument(Lang.MakeStringFromAnyP));
               break;
            
            case 'EXPORT':
               (function ()
                  {
                  if (Lang.IsNotStringP(currentAgentAlias))
                     {
                     self_.Error("Cannot EXPORT until the current agent connection is named with ALIAS");
                     return;
                     }
                  var valueFromPropertyName = {};
                  var qPrefixLength = getRangeNameFromPropertyName('').length;
                  sheet_.getNamedRanges().forEach(function (eRange)
                     {
                     var range = eRange.getRange();
                     var noteValue = range.getNote();
                     valueFromPropertyName[eRange.getName().substring(qPrefixLength)] = Lang.IsMeaningfulP(noteValue) ? noteValue : range.getValue();
                     eRange.remove();
                     });
                  importedValueFromPropertyNameFromAlias[currentAgentAlias] = valueFromPropertyName;
                  })();
               break;
            
            case 'UNINSTALL':
               self_.Uninstall();
               break;

            case 'STYLE':
               (function (styleType)
                  {
                  switch (styleType)
                     {
                     case 'BUTTON': 
                        selectedRange.setFontColor('#000');
                        selectedRange.setBackground('#ffff00');
                        selectedRange.setHorizontalAlignment('center');
                        break;

                     default:
                        self_.Error('Unknown STYLE type: ' + styleType);
                        break;
                     }
                  })(popArgument(Lang.MakeStringFromAnyP));
               break;

            case 'TITLE':
               (function (title)
                  {
                  sheet_.setName(Lang.MakeNameUniqueP('🧚 ' + title, n => null === spreadsheet_.getSheetByName(n)));
                  })(popArgument(Lang.MakeStringFromAnyP));
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
                        .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);

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
                  })(popArgument(Lang.MakeIntFromAnyP));
               break;

            case 'TURN_ON':
               if (!self_.TurnOn())
                  {
                  self_.InteractiveError('Unable to turn on');
                  rvExecutionDetails.didAbort = true;
                  nInstructionCount = 0;
                  }
               break;

            case 'TURN_OFF':
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
               self_.EvalCode(code, 'EVAL@'+iInstruction);                  
               break;

            case 'SELECT':
               (function (rangeIdentifier)
                  {
                  hasMergedCurrentSelection = false;
                  if ('STACK' === rangeIdentifier)
                     {
                     selectionTypeInstruction = 'STACK';
                     kSelectedRangePropertyName = null;
                     }
                  else
                     {
                     selectionTypeInstruction = null;
                     selectedRange = sheet_.getRange(rangeIdentifier);
                     kSelectedRangePropertyName = self_.FindNameUsingRangeP(selectedRange);
                     }
                  })(popArgument(Lang.MakeStringFromAnyP));
               break;

            case 'NAME':
               kSelectedRangePropertyName = Lang.MakeStringFromAnyP(eArguments[0]);
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kSelectedRangePropertyName), selectedRange);
               break;

            case 'TOGGLE':
               selectedRange.insertCheckboxes();
               if (Lang.IsContainedInSetP('TRUE', eArgumentSet))
                  {
                  selectedRange.check();
                  }
               self_.Log('+toggle: ' + kSelectedRangePropertyName);
               break;

            case 'FIELD':
               selectedRange.setBackground('#1c4587');
               self_.Log('+field: ' + kSelectedRangePropertyName);
               break;
            
            case 'NOTE':
               var value = eArguments.join('\n');
               selectedRange.setNote(value);
               self_.Log('+note: ' + kSelectedRangePropertyName, value);
               break;

            case 'CODE':
               console.log('TODO: make sure every newline literal from the args has a space after it when writing CODE instruction');
               var value = '  TURN_ON\n  EVAL "---"\n--------\n' + eArguments.join('\n ') + '\n--------\n  TURN_OFF';
               selectedRange.setNote(value);
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
               (function (isReadonly)
                  {
                  switch (selectionTypeInstruction)
                     {
                     case 'TOGGLE': setToggleReadonly_(selectedRange, isReadonly, true === selectedRange.isChecked()); break;
                     case 'FIELD': setFieldReadonly_(selectedRange, isReadonly); break;
                     case 'TEXT':
                     case 'NOTE':
                     case 'STACK':
                        self_.Warn('READONLY has no effect on type ' + selectionTypeInstruction);
                        break;
                     default: self_.Warn('READONLY used before the selection was given a type. Place this command after SELECT and one of the following instructions: ' + Object.keys(selectionTypeInstructionsSet).join(','));
                     }
                  })(Lang.IsAffirmativeStringP(eArguments[0]));
               break;

            case 'LOAD':
               (function (propertyName, kAlias)
                  {
                  var writeMethodFromTypeName = {
                     NOTE: self_.WriteNote,
                     FIELD: self_.WriteField,
                     TOGGLE: self_.WriteToggle,
                     STACK: ((name, value) => stackValues.push(value))
                  };
                  var previousValue = null;
                  if (Lang.IsNotStringP(propertyName))
                     {
                     self_.Error('LOAD: missing propertyName');
                     }
                  else if (importedValueFromPropertyNameFromAlias.hasOwnProperty(kAlias))
                     {
                     var importedValueFromPropertyName = importedValueFromPropertyNameFromAlias[kAlias];
                     if (Lang.IsObjectP(importedValueFromPropertyName)
                           && Lang.IsObjectP(importedValueFromPropertyName)
                           && Lang.IsMeaningfulP(previousValue = importedValueFromPropertyName[propertyName]))
                        {
                        (writeMethodFromTypeName[selectionTypeInstruction])(kSelectedRangePropertyName, previousValue);
                        }
                     else
                        {
                        self_.Warn('LOAD: no property named "' + propertyName + '" in "' + kAlias + '"; skipping');
                        }
                     }
                  else if (Lang.IsUndefinedP(kAlias))
                     {
                     var range = getRangeFromPropertyName(propertyName);
                     if (Lang.IsObjectP(range))
                        {
                        previousValue = range.getValue();
                        (writeMethodFromTypeName[selectionTypeInstruction])(kSelectedRangePropertyName, previousValue);
                        }
                     else
                        {
                        self_.Warn('LOAD: no property named "' + propertyName + '" in the current agent; skipping');
                        }
                     }
                  else
                     {
                     if (Platycore.IsVerbose)
                        {
                        self_.Warn('LOAD: "' + kAlias + '" is not available');
                        }
                     }
                  })(popArgument(Lang.MakeStringFromAnyP), popArgument(Lang.MakeStringFromAnyP));
               break;

            case 'PUSH':
               stackValues.push(eArguments[0]);
               break;

            case 'VALUE':
               switch (Lang.MakeStringFromAnyP(eArguments[0]))
                  {
                  case 'LAST_INSTALL_URL':
                     selectedRange.setValue(lastInstallUrl);
                     break;

                  default:
                     self_.Error('Unknown VALUE requested: ' + eArguments[0]);
                     break;
                  }
               break;
            
            case 'PANEL':
               var color = Lang.GetDarkRainbowColorFromAnyP(eArguments[0]);
               selectedRange.setBackground(color)
                    .setBorder(true, true, true, true, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
               break;

            case 'VALIDATE':
               if (Lang.IsContainedInSetP('IS_GMAIL_LABEL', eArgumentSet))
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
               if (Lang.IsContainedInSetP('IS_URL', eArgumentSet))
                  {
                  selectedRange.setDataValidation(
                        SpreadsheetApp.newDataValidation()
                              .requireTextIsUrl()
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

         return rvExecutionDetails;
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
// If an argument was provided to the constructor, try
// to Connect using it.

   self_.Connect(arguments[0]);

//------------------------------------------------------------------------------------------------------------------------------------

   }
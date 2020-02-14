
            //case 'TOOLBAR':
               // var irToolbar = instructions[++iInstruction];
               // sheet_.getRange(irToolbar, 1, 1, 49)
               //       .setBackground('#434343')
               //       .setBorder(false, false, true, false, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
            //   break;

// sheet_.getParent()


function Agent (sheet_, config_)
   {
   config_ = JSON.parse(JSON.stringify(config_ || {}));
   var self_ = this;
   var isThisOn_ = false;
   var spreadsheet_ = sheet_.getParent();

   var getRangeNameFromPropertyName = function (name)
      {
      return name + '_' + config_.agentName
      };

   var getRangeFromPropertyName = function (name)
      {
      return spreadsheet_.getRangeByName(name + '_' + config_.agentName);
      };

   // var getAllRangeNames = function ()
   //    {
   //    };

   self_.BootSectorGet = function ()
      {
      var rv = {
            agentName: config_.agentName,
            sheetNameHint: memory_.sheetNameHint,
            sheetId: memory_.sheetId,
            rangeNameFromPropertyName: {
                  EN:   getRangeNameFromPropertyName('EN'),
                  GO:   getRangeNameFromPropertyName('GO'),
                  WAKE: getRangeNameFromPropertyName('WAKE')
                  },
            valueFromPropertyName: {}
            };      
      return rv;
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Load memory_ for this execution 
//

   if (!Lang.IsObject(config_.memory))
      {
      if (!Lang.IsString(config_.agentName))
         {
         config_.agentName = 'platycoreAgent' + sheet_.getSheetId();
         }
      config_.memory = JSON.parse(PropertiesService.getDocumentProperties().getProperty(config_.agentName)) || {};
      }
   config_.agentName = config_.memory.agentName;
   var memory_ = config_.memory;

   memory_.valueFromName = {};
   memory_.readonlyNames = memory_.readonlyNames || [];

   console.log('agent created: ' + sheet_.getSheetId(), config_);

//------------------------------------------------------------------------------------------------------------------------------------
//
// Apply defaults
//

   if (!config_.hasOwnProperty('dtLockWaitMillis')) config_.dtLockWaitMillis = 15000;

//------------------------------------------------------------------------------------------------------------------------------------

   var read = function (name, ignoreCache, getValueFromRangeCallback)
      {
      return (ignoreCache || !memory_.valueFromName.hasOwnProperty(name)) ? (memory_.valueFromName[name] = getValueFromRangeCallback(getRangeFromPropertyName(name))) : memory_.valueFromPropertyName[name];
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
      return Lang.boolCast(read(name, ignoreCache, function (range) { return Lang.IsObject(range) ? range.getValue() : undefined }));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteToggle = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObject(range))
         {
         value = Lang.boolCast(value);
         if (memory_.readonlyNames.indexOf(name) >= 0)
            {
            range.setFormula(value ? '=TRUE' : '=FALSE');
            }
         else
            {
            range.setValue(value);
            }
         memory_.valueFromName[name] = value;
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
      return read(name, ignoreCache, function (range) { return Lang.IsObject(range) ? range.getValue() : undefined });
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteField = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObject(range))
         {
         range.setValue(memory_.valueFromName[name] = value);
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
      return Lang.stringCast(read(name, ignoreCache, function (range) { return Lang.IsObject(range) ? range.getNote() : undefined }));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteNote = function (name, value)
      {
      var range = getRangeFromPropertyName(name);
      if (Lang.IsObject(range))
         {
         range.setNote(memory_.valueFromName[name] = Lang.stringCast(value));
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
            return eNamedRange.getName().substring(0, eNamedRange.length - config_.agentName.length - 1);
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

   var irNewMessage_ = (function (range)
      {
      return Lang.IsObject(range) ? range.getRow() + 1 : 1;
      })(getRangeFromPropertyName('LOG'));

   var writeOutputFirstTime_ = function (args)
      {
      writeOutputNormal_(['']); // feed an extra line so that the bordering of the last line of the previous output doesn't get removed
      var rvRange = writeOutputNormal_(args);
      sheet_.getRange(irNewMessage_ + 1, 1, 1, 49)
            .setBorder(true, false, false, false, false, false, '#dadfe8', SpreadsheetApp.BorderStyle.SOLID_THICK);
      writeOutput_ = writeOutputNormal_;
      return rvRange;
      };

   var startsFromArgCount = [[],[ 2],[ 2,21],[ 2,21,36],[ 2,21,29,40]];
   var countsFromArgCount = [[],[48],[19,29],[19,15,14],[19, 7,10, 9]];

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
      sheet_.getRange(irNewMessage_, 1)
            .setNote(JSON.stringify([new Date().toISOString(),Lang.GetStackTrace(2)].concat(Object.keys(args).map(function (kArg){return args[kArg]}))));
      return sheet_.getRange(irNewMessage_, 1, 1, 49);
      };
   
   var writeOutput_ = writeOutputFirstTime_;

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes debug text to the output log for this sheet
//

   this.Log = function (message)
      {
      console.log.apply(console, arguments);
      writeOutput_(arguments).setFontColor('#00ff00').setBackground('black');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes an informational message to the output log for this sheet
//

   this.Info = function (message)
      {
      console.info.apply(console, arguments);
      writeOutput_(arguments).setFontColor('white').setBackground('black');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes a warning to the output log for this sheet
//

   this.Warn = function (message)
      {
      console.warn.apply(console, arguments);
      writeOutput_(arguments).setFontColor('yellow').setBackground('#38340a');
      self_.BadgeLastOutput('⚠️');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Writes an error message to the output log for this sheet
//

   this.Error = function (message)
      {
      console.error.apply(console, arguments);
      writeOutput_(arguments).setFontColor('red').setBackground('#3d0404');
      self_.BadgeLastOutput('❌');
      };


//------------------------------------------------------------------------------------------------------------------------------------
//
// Adds a single-character emoji to the left column of the last
// output, where the note that holds the JSON is attached.
//

   this.BadgeLastOutput = function (badge)
      {
      sheet_.getRange(irNewMessage_, 1).setValue(badge);
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

   this.Reboot = function ()
      {
      self_.Save();
      var rvAgent = new Agent(sheet_, config_);
      if (isThisOn_)
         {
         rvAgent.OverrideTurnOn();
         }
      sheet_ = null;
      config_ = null;
      memory_ = null;
      return rvAgent;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.Save = function ()
      {
      console.log('saving agent ' + config_.agentName);
      var documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty(config_.agentName, JSON.stringify(memory_));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.Uninstall = function ()
      {
      var rvMemory = memory_ || {};
      memory_ = null;
      sheet_.getNamedRanges().forEach(function (eRange) { eRange.remove() });
      spreadsheet_.deleteSheet(sheet_);
      sheet_ = null;
      try
         {
         PropertiesService.getDocumentProperties().deleteProperty(config_.agentName);
         }
      catch (e)
         {
         }
      config_ = null;
      console.log('rvMemory', rvMemory);
      return rvMemory;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.OverrideTurnOn = function ()
      {
      isThisOn_ = true;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.TurnOn = function ()
      {
      var dtMaxScriptExecutionTime = (60 *  5/*m*/+30/*s*/) * 1000;

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
         var canOverrideLock = dtMaxScriptExecutionTime < (Lang.GetTimestampNow() - lockValue);
         }
      else
         {
         var canOverrideLock = false;
         }

      var canTurnOn = !isAlreadyRunning || (hasLockField && canOverrideLock);
      if (canTurnOn)
         {
         var lock = LockService.getDocumentLock();
         if (!lock.tryLock(config_.dtLockWaitMillis))
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
               spreadsheet_.toast(config_.agentName + ': could not turn on');
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
         throw "cannot turn off; was not on";
         }
      self_.Save();
      isThisOn_ = false;
      var lock = LockService.getDocumentLock();
      if (lock.tryLock(config_.dtLockWaitMillis))
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
      var dt = Math.max(15000, dtMilliseconds);
      var maybePreviousWakeTime = self_.ReadField('WAKE');
      var utsNewWakeTime = utsNow + dt;
      if (Lang.IsNumber(maybePreviousWakeTime))
         {
         maybePreviousWakeTime = Lang.intCast(maybePreviousWakeTime);
         if (maybePreviousWakeTime < utsNow && maybePreviousWakeTime > (utsNow - 5 * 60 * 1000))
            {
            utsNewWakeTime = maybePreviousWakeTime + dt;
            }
         }
      self_.WriteField('WAKE', utsNewWakeTime); // note the lack of protection for only incrementing or decrementing this value. It just does whatever!
      self_.Log('snoozing for ' + Lang.stopwatchStringFromDuration(dt) + ' until ' + Lang.stopwatchStringFromDuration(utsNewWakeTime - Lang.GetTimestampNow()) + ' from now at ' + Lang.GetWallTimeFromTimestamp(utsNewWakeTime));
      self_.BadgeLastOutput(Lang.GetMoonPhaseFromDate(new Date(utsNewWakeTime)));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.SnoozeForever = function ()
      {
      self_.Log(Lang.GetMoonPhaseFromDate(Lang.GetTimestampNow()) + 'Snoozing, no alarm... ');
      self_.WriteField('WAKE', 'SNOOZE');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
//

   this.ExecuteRoutineFromUrl = function (urlAgentInstructions)
      {
      self_.Info('Fetching ' + Lang.ClampStringLengthP(urlAgentInstructions, 50));
      var dataUrlPrefix = 'data:application/x-gzip;base64,';
      if (urlAgentInstructions.substring(0, dataUrlPrefix.length) === dataUrlPrefix)
         {
         var agentInstructionsText = Lang.GetStringFromBase64Gzip(urlAgentInstructions.substring(dataUrlPrefix.length));
         }
      else
         {
         var agentInstructionsText = UrlFetchApp.fetch(urlAgentInstructions,{'headers':{'Cache-Control':'max-age=0'}}).getContentText();
         }

      var multilineConcatenationRegex = new RegExp(/"---+"\s---+\s([\s\S]+?)[\r\n]---+/gm);
      var whitespaceRegex = new RegExp(/^\s/);
      var associativeSplitRegex = new RegExp(/^\s+(\S+)\s*(.*)/);
      var agentInstructions = agentInstructionsText
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
                  self_.Warn('invalid line: ' + eLine);
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
      self_.Info('agentInstructionsText', agentInstructionsText);
      return self_.ExecuteRoutine(JSON.parse(agentInstructionsText));
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

         switch (eInstruction)
            {
            default:
               self_.Error('invalid instruction', eInstruction);
               break;

            case 'SELECT':
               selectedRange = sheet_.getRange(eArguments[0]);
               break;

            case 'NAME':
               var name = Lang.stringCast(eArguments[0]);
               memory_.name = name;
               self_.Info('Building agent "' + name + '" (' + config_.agentName + ')');
               break;

            case 'FREEZE':
               sheet_.setFrozenRows(Lang.intCast(eArguments[0]));
               break;

            case 'RESERVE':
               var qrRows = Lang.intCast(eArguments[0]);
               var irHeaders = qrRows;
               sheet_.insertRowsBefore(1, qrRows);
               irNewMessage_ = qrRows + 1;
               var mrMaxRows = sheet_.getMaxRows();
               var riFirstRowToDelete = Math.max(irHeaders + 2, sheet_.getLastRow() + 1);
               sheet_.deleteRows(riFirstRowToDelete, mrMaxRows - riFirstRowToDelete + 1);
               mrMaxRows = riFirstRowToDelete - 1;
               sheet_.getRange(1, 1, sheet_.getMaxRows(), sheet_.getMaxColumns())
                     .setFontColor('#00ff00')
                     .setBackground('black')
                     .setFontFamily('Courier New')
                     .setVerticalAlignment('top')
                     .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
                     
               sheet_.getRange(qrRows, 1, 1, sheet_.getMaxColumns()).setBorder(false, false, true, false, false, false, '#dadfe8', SpreadsheetApp.BorderStyle.SOLID_THICK);
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName('LOG'), sheet_.getRange(qrRows, 1, sheet_.getMaxRows()-qrRows+1, sheet_.getMaxColumns()));
               break;

            case 'REBOOT':
               self_.Log('Rebooting...');
               return self_.Reboot().ExecuteRoutine(instructions.slice(iInstruction+1));
            
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

            case 'REINSTALL': // execute code if this is a reinstall operation; guarantee access to the variable previousInstallMemory
               var code = eArguments.join('\n');
               var previousInstallMemory = config_.previousInstallMemory;
               if (Lang.IsObject(previousInstallMemory))
                  {
                  (function (agent, previousInstallMemory)
                     {
                     eval(code);
                     })(self_, previousInstallMemory);
                  }
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

            case 'TOGGLE':
               var kName = eArguments[0];
               selectedRange.insertCheckboxes();
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kName), selectedRange);
               if (Lang.IsValueContainedInSetP('READONLY', eArgumentSet))
                  {
                  memory_.readonlyNames.push(kName);
                  }
               else
                  {
                  selectedRange.setFontColor('#00ffff'); // editable
                  }
               var value = Lang.IsValueContainedInSetP('TRUE', eArgumentSet);
               self_.Log('+toggle: ' + kName, value);
               self_.WriteToggle(kName, value);
               break;

            case 'FIELD':
               var kName = eArguments[0];
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kName), selectedRange);
               var textStyleBuilder = selectedRange.getTextStyle().copy();
               if (Lang.IsValueContainedInSetP('READONLY', eArgumentSet))
                  {
                  memory_.readonlyNames.push(kName);
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
               if (Lang.IsValueContainedInSetP('UPGRADE', eArgumentSet))
                  {
                  if (Lang.IsObject(previousInstallMemory)
                        && Lang.IsObject(previousInstallMemory.valueFromName))
                     {
                     value = previousInstallMemory.valueFromName[kName];
                     self_.WriteField(kName, value);
                     }
                  }
               self_.Log('+field: ' + kName, value);
               break;
            
            case 'NOTE':
               var kName = eArguments[0];
               spreadsheet_.setNamedRange(getRangeNameFromPropertyName(kName), selectedRange);
               var value = eArguments.slice(1).join('\n');
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
   }
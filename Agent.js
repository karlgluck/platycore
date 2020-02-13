
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

   self_.BootSectorGet = function ()
      {
      var rv = {
            agentName: config_.agentName,
            sheetNameHint: memory_.sheetNameHint,
            sheetId: memory_.sheetId
            };
      if (!Lang.IsUndefined(self_.ReadToggle('EN')))
         {
         rv.EN = memory_.toggleFromName['EN'];
         }
      if (!Lang.IsUndefined(self_.ReadField('WAKE')))
         {
         rv.WAKE = memory_.fieldFromName['WAKE'];
         }
      if (!Lang.IsUndefined(self_.ReadToggle('GO')))
         {
         rv.GO = memory_.toggleFromName['GO'];
         }
      
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
      config_.memory = JSON.parse(PropertiesService.getDocumentProperties().getProperty(config_.agentName));
      }
   config_.agentName = config_.memory.agentName;
   var memory_ = config_.memory;
   memory_.toggleFromName = memory_.toggleFromName || {};
   memory_.fieldFromName = memory_.fieldFromName || {};
   memory_.noteFromName = memory_.noteFromName || {};

   // memory_.values = memory_.values || {};
   // memory_.readonly = memory_.readonly || [];

   this.ClearCache = function ()
      {
      ['toggleFromName', 'fieldFromName', 'noteFromName'].forEach(function (kDictionary)
         {
         var eDictionary = memory_[kDictionary];
         
         Object.keys(eDictionary).forEach(function (kName)
            {
            var dictionary = eDictionary[kName];
            delete dictionary.value; // make absolutely sure this doesn't exist
            });

         });
      };
   self_.ClearCache();

   console.log('agent created: ' + sheet_.getSheetId(), config_);


//------------------------------------------------------------------------------------------------------------------------------------
//
// Apply defaults
//

   if (!config_.hasOwnProperty('dtLockWaitMillis')) config_.dtLockWaitMillis = 15000;


   var getRangeFromAttributeName = function (name) { return sheet_.getParent().getRangeByName(name + '_' + config_.agentName) };


   this.CanRead = function (name)
      {
      return memory_.values
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

   this.ReadToggle = function (name, ignoreCache)
      {
      try
         {
         var toggle = memory_.toggleFromName[name];
         if (Lang.IsUndefined(toggle))
            {
            return undefined;
            }
         if (ignoreCache || !toggle.hasOwnProperty('value'))
            {
            toggle.value = Lang.boolCast(sheet_.getRange(toggle.r, toggle.c).getValue());
            }
         return toggle.value;
         }
      catch (e)
         {
         console.warn('ReadToggle('+name+') suppressed', e, e.stack);
         return undefined;
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteToggle = function (name, value)
      {
      try
         {
         value = Lang.boolCast(value);
         if (memory_.toggleFromName.hasOwnProperty(name))
            {
            var toggle = memory_.toggleFromName[name];
            }
         else 
            {
            console.error('writing nonexistant toggle "' + name + '"');
            return;
            }
         var checkboxRange = sheet_.getRange(toggle.r, toggle.c, 1, 1);
         if (toggle.isReadonly)
            {
            checkboxRange.setFormula(value ? '=TRUE' : '=FALSE');
            }
         else
            {
            checkboxRange.setValue(value);
            }
         toggle.value = value;
         }
      catch (e)
         {
         console.warn('WriteToggle('+name+','+value+') suppressed', e, e.stack);
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
      try
         {
         var field = memory_.fieldFromName[name];
         if (Lang.IsUndefined(field))
            {
            return undefined;
            }
         if (ignoreCache || !field.hasOwnProperty('value'))
            {
            field.value = sheet_.getRange(field.r, field.c).getValue();
            }
         return field.value;
         }
      catch (e)
         {
         console.warn('ReadField('+name+') suppressed', e, e.stack);
         return undefined;
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------
   
   this.WriteField = function (name, value)
      {
      try
         {
         value = Lang.stringCast(value);
         if (memory_.fieldFromName.hasOwnProperty(name))
            {
            var field = memory_.fieldFromName[name];
            }
         else 
            {
            console.error('writing nonexistant field "' + name + '"');
            return;
            }
         sheet_.getRange(field.r, field.c, field.h, field.w).setValue(value);
         field.value = value;
         }
      catch (e)
         {
         console.warn('WriteField('+name+','+value+') suppressed', e, e.stack);
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

   this.ReadNote = function (name)
      {
      try
         {
         var note = memory_.noteFromName[name];
         if (!note.hasOwnProperty('value'))
            {
            note.value = Lang.stringCast(sheet_.getRange(note.r, note.c).getNote());
            }
         return note.value;
         }
      catch (e)
         {
         console.warn('ReadNote('+name+') suppressed', e, e.stack);
         return undefined;
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadObjectFromNote = function (name)
      {
      try
         {
         return JSON.parse(self_.ReadNote(name));
         }
      catch (e)
         {
         return {};
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteNote = function (name, value)
      {
      try
         {
         value = Lang.stringCast(value);
         if (memory_.noteFromName.hasOwnProperty(name))
            {
            var note = memory_.noteFromName[name];
            }
         else 
            {
            console.error('writing nonexistant note "' + name + '"');
            return;
            }
         sheet_.getRange(note.r, note.c).setNote(value);
         note.value = value;
         }
      catch (e)
         {
         console.warn('ReadNote('+name+','+value+') suppressed', e, e.stack);
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------
// 
// "Find" is used rather than "Get" to convey the higher
// cost of invoking this function.
//

   this.FindNoteNameFromRangeP = function (range)
      {
      var irRow = range.getRow();
      var icColumn = range.getColumn();
      var noteFromName = memory_.noteFromName;
      var noteNames = Object.keys(noteFromName);
      for (var iNoteName = 0, nNoteNameCount = noteNames.length; iNoteName < nNoteNameCount; ++iNoteName)
         {
         var ekNoteName = noteNames[iNoteName];
         var eNote = noteFromName[ekNoteName];
         if (irRow == eNote.r && icColumn == eNote.c)
            {
            return ekNoteName;
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

   var irNewMessage_ = sheet_.getFrozenRows() + 1;

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
      PropertiesService.getDocumentProperties().deleteProperty(config_.agentName);
      sheet_.getParent().deleteSheet(sheet_);
      sheet_ = null;
      config_ = null;
      var rvMemory = memory_ || {};
      memory_ = null;
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
      var isAlreadyRunning = Lang.boolCast(self_.ReadToggle('ON', true));
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
               sheet_.getParent().toast(config_.agentName + ': could not turn on');
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
                  .map(function (e, i) { return e.replace(/;/,';lineNumber='+(i+1)+';'); })
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
               var qrFrozenRows = Lang.intCast(eArguments[0]);
               var irHeaders = qrFrozenRows;
               sheet_.insertRowsBefore(1, qrFrozenRows);
               sheet_.setFrozenRows(qrFrozenRows);
               irNewMessage_ = qrFrozenRows + 1;
               var mrMaxRows = sheet_.getMaxRows();
               var riFirstRowToDelete = Math.max(irHeaders + 2, sheet_.getLastRow() + 1);
               sheet_.deleteRows(riFirstRowToDelete, mrMaxRows - riFirstRowToDelete + 1);
               mrMaxRows = riFirstRowToDelete - 1;
               sheet_.getRange(1, 1, mrMaxRows, 49)
                     .setFontColor('#00ff00')
                     .setBackground('black')
                     .setFontFamily('Courier New')
                     .setVerticalAlignment('top')
                     .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
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
               var toggle = {
                     "r": selectedRange.getRow(),
                     "c": selectedRange.getColumn(),
                     "w": selectedRange.getWidth(),
                     "h": selectedRange.getHeight(),
                     "isReadonly": Lang.IsValueContainedInSetP('READONLY', eArgumentSet)
                     };
               if (memory_.toggleFromName.hasOwnProperty(kName))
                  {
                  self_.Warn('TODO: shift an existing toggle safely (copy value; unmerge old toggle cells)');
                  }
               memory_.toggleFromName[kName] = toggle;
               selectedRange.insertCheckboxes();
               if (!toggle.isReadonly)
                  {
                  selectedRange.setFontColor('#00ffff'); // editable
                  }
               var value = Lang.IsValueContainedInSetP('TRUE', eArgumentSet);
               self_.Log('+toggle: ' + kName, value);
               self_.WriteToggle(kName, value);
               break;

            case 'FIELD':
               var kName = eArguments[0];
               var field = {
                     "r": selectedRange.getRow(),
                     "c": selectedRange.getColumn(),
                     "w": selectedRange.getWidth(),
                     "h": selectedRange.getHeight(),
                     "isReadonly": Lang.IsValueContainedInSetP('READONLY', eArgumentSet)
                     };
               if (memory_.fieldFromName.hasOwnProperty(kName))
                  {
                  self_.Warn('TODO: shift an existing field safely (copy value; unmerge old field cells)');
                  }
               memory_.fieldFromName[kName] = field;
               var value = '';
               self_.Log('+field: ' + kName, value);
               self_.WriteField(kName, value);
               
               var textStyleBuilder = selectedRange.getTextStyle().copy();
               if (field.isReadonly)
                  {
                  textStyleBuilder.setForegroundColor('#666666');
                  }
               else
                  {
                  textStyleBuilder
                        .setForegroundColor('#00ffff')
                        .setUnderline(true);
                  }
               selectedRange.setTextStyle(textStyleBuilder.build());
               break;
            
            case 'NOTE':
               var kName = eArguments[0];
               var note = {
                  "r": selectedRange.getRow(),
                  "c": selectedRange.getColumn()
               };
               memory_.noteFromName[kName] = note;
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
// creating an Agent is a minimal operation to identify whether the Agent needs to run
// the agent needs to run if:
// (1) the EN toggle is checked or does not exist
// and either:
// (2a) the GO toggle exists and is checked
// (2b) the WAKE timer exists and the current time is later than the wake timer

// the wake timer's value and the GO toggle are saved in memory
//    so that Platycore doesn't have to read the sheet every time
// however, these values are cleared whenever the sheet is updated more recently than the agent was last saved

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
      if (!Util_isUndefined(self_.ReadToggle('EN')))
         {
         rv.EN = memory_.toggleFromName['EN'];
         }
      if (!Util_isUndefined(self_.ReadField('WAKE')))
         {
         rv.WAKE = memory_.fieldFromName['WAKE'];
         }
      if (!Util_isUndefined(self_.ReadToggle('GO')))
         {
         rv.GO = memory_.toggleFromName['GO'];
         }
      
      return rv;
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Load memory_ for this execution 
//

   if (!Util_isObject(config_.memory))
      {
      config_.memory = JSON.parse(PropertiesService.getDocumentProperties().getProperty(config_.agentName));
      }
   config_.agentName = config_.memory.agentName;
   var memory_ = config_.memory;
   memory_.toggleFromName = memory_.toggleFromName || {};
   memory_.fieldFromName = memory_.fieldFromName || {};
   memory_.noteFromName = memory_.noteFromName || {};

   memory_.scriptFromName = memory_.scriptFromName || {};
   memory_.scriptNames = memory_.scriptNames || [];


   if (!Util_isObject(sheet_))
      {
      }

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
// 
// 


// maybe add to a 'LoadConditionalFormatRules' that lets us do conditional format rule manipulation on this agent

   // var conditionalFormatRules_ = sheet_.getConditionalFormatRules().map(function (eRule)
   //    {
   //    return{
   //          gasConditionalFormatRule: eRule,
   //          ranges: eRule.getRanges().map(function (eRange)
   //             {
   //             return{
   //                   r: eRange.getRow(),
   //                   c: eRange.getColumn(),
   //                   w: eRange.getWidth(),
   //                   h: eRange.getHeight(),
   //                   gasRange: eRange
   //                   }
   //             })
   //          }
   //    });

//------------------------------------------------------------------------------------------------------------------------------------

   // var getConditionalFormatRuleByArea = function (irRow, icColumn, qrHeight, qcWidth)
   //    {
   //    for (var i = 0, n = conditionalFormatRules_.length; i < n; ++i)
   //       {
   //       var eConditionalFormatRule = conditionalFormatRules_[i];
   //       var ranges = eConditionalFormatRule.ranges;
   //       if (ranges.length == 1 && ranges[0].r == irRow && ranges[0].c == icColumn && ranges[0].h == qrHeight && ranges[0].w == qcWidth)
   //          {
   //          return eConditionalFormatRule;
   //          }
   //       }
   //    return null;
   //    };

//------------------------------------------------------------------------------------------------------------------------------------
//
// Apply defaults
//

   if (!config_.hasOwnProperty('dtLockWaitMillis')) config_.dtLockWaitMillis = 15000;


//------------------------------------------------------------------------------------------------------------------------------------
//
// Accessors
//

   Util_makeLazyConstantMethod(this, 'getSheetId', function () { return sheet_.getSheetId() });
   Util_makeLazyConstantMethod(this, 'kSheetId_Get', function () { return sheet_.getSheetId() });
   Util_makeLazyConstantMethod(this, 'isVerbose_', function () { return !!config_.verbose || self_.ReadToggle('VERBOSE') });


//------------------------------------------------------------------------------------------------------------------------------------

   var scriptFromNameP_ = function (name)
      {
      try
         {
         var rvScript = memory_.scriptFromName[name];
         }
      catch (e)
         {
         }
      finally
         {
         return rvScript || { blockCodeNoteNames: [] };
         }
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
         if (Util_isUndefined(toggle))
            {
            return undefined;
            }
         if (ignoreCache || !toggle.hasOwnProperty('value'))
            {
            toggle.value = Util_boolCast(sheet_.getRange(toggle.r, toggle.c).getValue());
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
         value = Util_boolCast(value);
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
         if (name === 'VERBOSE') // re-initialize the self-constantizing method to keep the VERBOSE toggle in sync
            {
            Util_makeLazyConstantMethod(self_, 'isVerbose_', function () { return !!config_.verbose || self_.ReadToggle('VERBOSE') });
            }
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
         if (Util_isUndefined(field))
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
         value = Util_stringCast(value);
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

//------------------------------------------------------------------------------------------------------------------------------------
   
   this.ReadArrayIndexFromField = function (name, mArrayLength)
      {
      var value = self_.ReadField(name);
      if (Util_isNumber(value))
         {
         value = value >>> 0;
         if (value > mArrayLength - 1)
            {
            return undefined;
            }
         return value;
         }
      else
         {
         return undefined;
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
            note.value = Util_stringCast(sheet_.getRange(note.r, note.c).getNote());
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
         value = Util_stringCast(value);
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
      var range = writeOutputNormal_(args);
      sheet_.getRange(irNewMessage_ + 1, 1, 1, 49)
            .setBorder(true, false, false, false, false, false, '#dadfe8', SpreadsheetApp.BorderStyle.SOLID_THICK);
      writeOutput_ = writeOutputNormal_;
      return range;
      };

   var startsFromArgCount = [[],[ 2],[ 2,21],[ 2,21,36],[ 2,21,29,40]];
   var countsFromArgCount = [[],[48],[19,29],[19,15,14],[19, 7,10, 9]];

   var writeOutputNormal_ = function (args)
      {
      // if (!isThisOn_)
      //    {
      //    return sheet_.getRange(1, 49);
      //    }
      var nArgCount = Math.min(args.length, startsFromArgCount.length - 1);
      var starts = startsFromArgCount[nArgCount];
      var counts = countsFromArgCount[nArgCount];
      sheet_.insertRowBefore(irNewMessage_);
      for (var iArg = nArgCount - 1; iArg >= 0; --iArg)
         {
         sheet_.getRange(irNewMessage_, starts[iArg], 1, counts[iArg]).mergeAcross().setValue(args[iArg]).setHorizontalAlignment('left');
         }
      sheet_.getRange(irNewMessage_, 1)
            .setNote(JSON.stringify([new Date().toISOString(),Util_stackTraceGet(2)].concat(Object.keys(args).map(function (kArg){return args[kArg]}))));
      return sheet_.getRange(irNewMessage_, 1, 1, 49);
      };
   
   var writeOutput_ = writeOutputFirstTime_;

//------------------------------------------------------------------------------------------------------------------------------------

   this.Verbose = function (callback)
      {
      if (self_.isVerbose_())
         {
         var output = callback();
         if (!Array.isArray(output))
            {
            output = [output];
            }
         console.log.apply(console, output);
         writeOutput_(output).setFontColor('#b6d7a8').setBackground('black');
         }
      };

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

   this.UrlAgentInstructionsGet = function (kName) // this is a tricky function to replace cleanly, but I'd like to get rid of it somehow
      {
      return memory_.urlAgentInstructions;
      };

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
      var documentProperties = PropertiesService.getDocumentProperties();
      documentProperties.setProperty(config_.agentName, JSON.stringify(memory_));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.Uninstall = function ()
      {
      if (memory_.hasOwnProperty('uninstall'))
         {
         self_.Verbose(function () { return [memory_.uninstall] });
         try
            {
            eval(memory_.uninstall);
            }
         catch (e)
            {
            }
         }
      PropertiesService.getDocumentProperties().deleteProperty(config_.agentName);
      sheet_.getParent().deleteSheet(sheet_);
      sheet_ = null;
      return memory_;
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
      var isAlreadyRunning = Util_boolCast(self_.ReadToggle('ON', true));
      var lockValue = self_.ReadField('LOCK', true);
      var hasLockField = !Util_isUndefined(lockValue);
      if (hasLockField)
         {
         lockValue = Util_intCast(lockValue);
         var lockValueWithSentinel = (lockValue - (lockValue % 1000)) + (((lockValue % 1000) + 1) % 1000);
         self_.WriteField('LOCK', lockValueWithSentinel);
         var canOverrideLock = dtMaxScriptExecutionTime < (Util_utsNowGet() - lockValue);
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
               isAlreadyRunning = Util_boolCast(self_.ReadToggle('ON', true));
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
               self_.WriteField('LOCK', Util_utsNowGet());
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
      self_.Save();
      };

//------------------------------------------------------------------------------------------------------------------------------------
// 

   this.FormulaDetectingAnyChanges_GetP = function (ignoredNames)
      {
      var toggles = Object.keys(memory_.toggleFromName).map(function (kName)
         {
         if (Util_ContainsElementInArray())
         var value = self_.ReadToggle(kName);
         if (Util_isUndefined(value))
            {
            return "FALSE";
            }
         var eToggle = memory_.toggleFromName[kName];
         return "NE(" + GAS_A1AddressFromCoordinatesP(eToggle.r, eToggle.c) + (value ? ",TRUE)" : ",FALSE)");
         });
      var fields = Object.keys(memory_.fieldFromName).map(function (kName)
         {
         var value = self_.ReadField(kName);
         if (Util_isUndefined(value))
            {
            return "FALSE"
            }
         var eField = memory_.fieldFromName[kName];
         return "NE(" + GAS_A1AddressFromCoordinatesP(eField.r, eField.c) + ',"' + String(value).replace('"', '""') + '")';
         });

      var en = memory_.toggleFromName.EN;
      return '=AND(' + GAS_A1AddressFromCoordinatesP(en.r, en.c) + ',OR(FALSE,' + toggles.concat(fields).join(',') + '))';
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
      if (Util_isUndefined(script))
         {
         return;
         }

      var code = self_.ReadNote(script);
      if (Util_isUndefined(code))
         {
         self_.Warn('Invalid SCRIPT: ' + script);
         return;
         }
      
      (function (agent)
         {                    // Script code references the "agent" variable,
         eval(code);          // whereas code here in the script itself uses 
         })(self_);           // 'self_' (to distinguish it from 'this'!). Clear on all the differences? Good!
      
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

   this.Snooze = function (dtMilliseconds)
      {
      self_.Log('Snooze('+dtMilliseconds+') called @ Util_utsNowGet() = ' + Util_wallTimeFromTimestamp(Util_utsNowGet()));
      var dt = Math.max(15000, dtMilliseconds);
      var utsMaybePreviousWakeTime = self_.ReadField('WAKE');
      self_.Log('utsMaybePreviousWakeTime = ' + Util_wallTimeFromTimestamp(utsMaybePreviousWakeTime));
      var utsNewWakeTime = dt + Util_utsNowGet();
      self_.Log('utsNewWakeTime', Util_wallTimeFromTimestamp(utsNewWakeTime));
      self_.BadgeLastOutput(Util_moonPhaseFromDate(new Date(utsNewWakeTime)));
      self_.WriteField('WAKE', utsNewWakeTime); // note the lack of protection for only incrementing or decrementing this value. It just does whatever!
      self_.Log('HII - Snoozing asked for ' + Util_stopwatchStringFromDuration(dt) + ', alarm set for ' + Util_stopwatchStringFromDuration(utsNewWakeTime - Util_utsNowGet()) + ' from now at ' + Util_wallTimeFromTimestamp(utsNewWakeTime), new Date(utsNewWakeTime));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.SnoozeForever = function ()
      {
      self_.Log(Util_moonPhaseFromDate(Util_utsNowGet()) + 'Snoozing, no alarm... ');
      self_.WriteField('WAKE', 'SNOOZE');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
//

   this.ExecuteRoutineFromUrl = function (urlAgentInstructions)
      {
      self_.Info('Fetching ' + Util_clampStringLengthP(urlAgentInstructions, 50));
      if (urlAgentInstructions.substring(0, 22) === 'data:text/json;base64,')
         {
         var jsonAgentInstructions = Util_stringFromBase64(urlAgentInstructions.substring(22));
         }
      else
         {
         var jsonAgentInstructions = UrlFetchApp.fetch(urlAgentInstructions,{'headers':{'Cache-Control':'max-age=0'}}).getContentText();
         }
      self_.Info('jsonAgentInstructions', jsonAgentInstructions);
      return self_.ExecuteRoutine(JSON.parse(jsonAgentInstructions));
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
      if (!Util_isArray(instructions)) throw "instructions";
      
      for (var iInstruction = 0, nInstructionCount = instructions.length; iInstruction < nInstructionCount; ++iInstruction)
         {
         var eInstruction = instructions[iInstruction];

         switch (eInstruction)
            {
            default:
               self_.Error('invalid instruction', eInstruction);
               break;

            case 'NAME':
               var name = instructions[++iInstruction];
               memory_.name = name;
               self_.Info('Building agent "' + name + '" (' + config_.agentName + ')');
               break;
            
            //case 'TOOLBAR':
               // var irToolbar = instructions[++iInstruction];
               // sheet_.getRange(irToolbar, 1, 1, 49)
               //       .setBackground('#434343')
               //       .setBorder(false, false, true, false, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
            //   break;

            case 'FREEZE':
               var qrFrozenRows = instructions[++iInstruction];
               self_.Verbose(function () { return 'freezing ' + qrFrozenRows + ' rows'; });
               var irHeaders = qrFrozenRows;
               sheet_.insertRowsBefore(1, qrFrozenRows);
               sheet_.setFrozenRows(qrFrozenRows);
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
               return self_.Reboot().ExecuteRoutine(instructions.slice(iInstruction+1));

            case 'REBOOT':
               self_.Verbose(function () { return 'reboot'; });
               return self_.Reboot().ExecuteRoutine(instructions.slice(iInstruction+1));
            
            case 'VERBOSE':
               self_.Verbose(function () { return instructions[++iInstruction] });
               break;
            
            case 'OFF':
               self_.TurnOff();
               break;

            case 'INFO':
               self_.Info(instructions[++iInstruction]);
               break;

            case 'WARN':
               self_.Warn(instructions[++iInstruction]);
               break;

            case 'ERROR':
               self_.Error(instructions[++iInstruction]);
               break;

            case 'REINSTALL': // execute code if this is a reinstall operation; guarantee access to the variable previousInstallMemory
               var code = instructions[++iInstruction].join('\n');
               var previousInstallMemory = config_.previousInstallMemory;
               if (Util_isObject(previousInstallMemory))
                  {
                  (function (agent, previousInstallMemory)
                     {
                     eval(code);
                     })(self_, previousInstallMemory);
                  }
               break;

            case 'EVAL':
               var code = instructions[++iInstruction].join('\n');
               (function (agent)
                  {
                  eval(code);
                  })(self_);
               break;
            
            case 'TEXT':
               var text = instructions[++iInstruction];
               var rangeCommand = instructions[++iInstruction];
               var range = sheet_.getRange(rangeCommand.r, rangeCommand.c, rangeCommand.h || 1, rangeCommand.w || 1);
               range.setValue(text);
               if (rangeCommand.hasOwnProperty('bg'))
                  {
                  range.setBackground(rangeCommand.bg);
                  }
               if (rangeCommand.hasOwnProperty('fg'))
                  {
                  range.setFontColor(rangeCommand.fg);
                  }
               switch ((rangeCommand.hasOwnProperty('w') ? 1 : 0) + (rangeCommand.hasOwnProperty('h') ? 2 : 0))
                  {
                  case 1: /* w   */ range.mergeAcross(); break;
                  case 2: /* h   */ range.mergeVertically(); break;
                  case 3: /* w+h */ range.merge(); break;
                  }
               break;

            case 'RANGE':
               var rangeCommand = instructions[++iInstruction];
               var range = sheet_.getRange(rangeCommand.r, rangeCommand.c, rangeCommand.h || 1, rangeCommand.w || 1);
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
               var uninstallScript = instructions[++iInstruction].join('\n');
               memory_.uninstall = uninstallScript;
               return self_.Reboot().ExecuteRoutine(instructions.slice(iInstruction+1));

            case 'FIELD':
               (function (name, field)
                  {
                  if (!field.hasOwnProperty('w'))
                     {
                     field.w = 1;
                     }
                  if (!field.hasOwnProperty('h'))
                     {
                     field.h = 1;
                     }
                  if (memory_.fieldFromName.hasOwnProperty(name))
                     {
                     console.log('TODO: shift an existing field safely (copy value; unmerge old cells)');
                     }
                  memory_.fieldFromName[name] = field;
                  self_.Log('+field: ' + name, field.r, field.c, field.h, field.w);
                  
                  var range = sheet_.getRange(field.r, field.c, field.h, field.w);
                  range.merge()
                        //.setBackground(field.hasOwnProperty('bg') ? field.bg : '#000000')
                        //.setBorder(true, true, true, true, false, false, field.borderColor || '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
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
                  else
                     {
                     field.value = '';
                     }
                  var textStyleBuilder = range.getTextStyle().copy();
                  if (field.isReadonly)
                     {
                     var fontColor = '#666666';
                     }
                  else
                     {
                     var fontColor = '#00ffff';
                     textStyleBuilder.setUnderline(true);
                     }
                  if (field.hasOwnProperty('fg'))
                     {
                     fontColor = field.fg;
                     delete field.fg;
                     }
                  textStyleBuilder.setForegroundColor(fontColor);
                  range.setTextStyle(textStyleBuilder.build());
                  })(instructions[++iInstruction], instructions[++iInstruction]);
               break;
            
            case 'NOTE': // NOTE "<name>"  {"r": "<riRow>", "c": "<ciCol>"} <any>
               var kName = instructions[++iInstruction];
               var note = JSON.parse(JSON.stringify(instructions[++iInstruction]));
               var value = instructions[++iInstruction];
               memory_.noteFromName[kName] = note;
               if (Util_isString(value))
                  {
                  // value = value;
                  }
               else if (Util_isArray(value) && value.every(Util_isString))
                  {
                  value = value.join('\n'); // this is an array of strings, so turn it into lines of text
                  }
               else
                  {
                  value = JSON.stringify(value);
                  }
               self_.Log('+note: ' + kName, value);
               sheet_.getRange(note.r, note.c).setNote(value);
               note.value = value;
               break;
            
            case 'PANEL':
               var color = Util_darkRainbowColorFromAnyP(iInstruction);
               var location = instructions[++iInstruction];
               sheet_.getRange(location.r, location.c, location.h || 1, location.w || 1)
                     .setBackground(color)
                     .setBorder(true, true, true, true, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
               break;
            
            case 'REM':
               console.log('REM ' + instructions[++iInstruction]);
               break;

            case 'SCRIPT': // SCRIPT "<name>" <qBlockCount>
               var kName = instructions[++iInstruction];
               var script = {blockCodeNoteNames:instructions[++iInstruction]};
               self_.Log('+script: ' + kName, script.blockCodeNoteNames);
               memory_.scriptFromName[kName] = script;
               memory_.scriptNames.push(kName);
               break;

            case 'TOAST':
               spreadsheet.toast(instructions[++iInstruction]);
               break;

            case 'TOGGLE':
               (function (name, toggle)
                  {
                  memory_.toggleFromName[name] = toggle;
                  var toggleText = toggle.t || name;
                  toggle.isReadonly = !!toggle.isReadonly;
                  if (!toggle.hasOwnProperty('w')) toggle.w = 1;
                  if (memory_.toggleFromName.hasOwnProperty(name))
                     {
                     console.log('TODO: shift an existing toggle safely (copy value; unmerge old toggle cells)');
                     }
                  toggle.value = Util_boolCast(toggle.value);
                  self_.Log('+toggle: ' + name + ' (' + toggleText + ')' + (toggle.isReadonly ? ' [READONLY]' : ''), toggle.r, toggle.c, toggle.w);
                  var checkboxRange = sheet_.getRange(toggle.r, toggle.c).insertCheckboxes();
                  if (toggle.isReadonly)
                     {
                     checkboxRange.setFormula(toggle.value ? '=TRUE' : '=FALSE');
                     }
                     else
                     {
                     checkboxRange.setValue(toggle.value);
                     }
                  var qcColumns = toggle.w - 1;
                  if (qcColumns > 0)
                     {
                     sheet_.getRange(toggle.r, toggle.c+1, 1, qcColumns).mergeAcross().setValue(toggleText);
                     }
                  var range = sheet_.getRange(toggle.r, toggle.c, 1, toggle.w);
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
                  })(instructions[++iInstruction], instructions[++iInstruction]);
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
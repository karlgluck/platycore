

function Agent (sheet_, config_)
   {
   console.log('agent starting up: ' + sheet_.getSheetId(), config_);
   var self_ = this;

//------------------------------------------------------------------------------------------------------------------------------------
// 
// 
// 

   config_ = JSON.parse(JSON.stringify(config_ || {}));
   var isThisOn_ = !!config_.forceThisOn;
   config_.utsNow = Util_isNumber(config_.utsNow) ? config_.utsNow : Util_utsNowGet();

   var conditionalFormatRules_ = sheet_.getConditionalFormatRules().map(function (eRule)
      {
      return{
            gasConditionalFormatRule: eRule,
            ranges: eRule.getRanges().map(function (eRange)
               {
               return{
                     r: eRange.getRow(),
                     c: eRange.getColumn(),
                     w: eRange.getWidth(),
                     h: eRange.getHeight(),
                     gasRange: eRange
                     }
               })
            }
      });


//------------------------------------------------------------------------------------------------------------------------------------

   var getConditionalFormatRuleByArea = function (irRow, icColumn, qrHeight, qcWidth)
      {
      for (var i = 0, n = conditionalFormatRules_.length; i < n; ++i)
         {
         var eConditionalFormatRule = conditionalFormatRules_[i];
         var ranges = eConditionalFormatRule.ranges;
         if (ranges.length == 1 && ranges[0].r == irRow && ranges[0].c == icColumn && ranges[0].h == qrHeight && ranges[0].w == qcWidth)
            {
            return eConditionalFormatRule;
            }
         }
      return null;
      };

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
//
// Load memory_ for this execution (clear cache, reserved flags, etc.)
//

   if (!Util_isObject(config_.memory))
      {
      config_.memory = JSON.parse(PropertiesService.getDocumentProperties().getProperty('platycoreAgent' + this.getSheetId()));
      }
   var memory_ = config_.memory;
   memory_.toggleFromName = memory_.toggleFromName || {};
   memory_.fieldFromName = memory_.fieldFromName || {};
   memory_.scriptFromName = memory_.scriptFromName || {};
   memory_.scriptNames = memory_.scriptNames || [];

//------------------------------------------------------------------------------------------------------------------------------------
//
// Clear all cached values from memory if the document was
// modified more recently than the cache was updated.
//

   (function (isCacheExpired)
      {

      console.log('isCacheExpired', isCacheExpired);

      ['toggleFromName', 'fieldFromName', 'noteFromName'].forEach(function (kDictionary)
         {
         var eDictionary = memory_[kDictionary];
         
         Object.keys(eDictionary).forEach(function (kName)
            {
            var dictionary = eDictionary[kName];
            if (dictionary.hasOwnProperty('fVirtual')) // virtual properties are set when fields, toggles,
               {                                       // and notes are not set by the creation script
               return;
               }
            delete dictionary.fRuleIsSynced; // won't apply to all of them but it doesn't hurt
            if (isCacheExpired) delete dictionary.valueCached; // this is really what we want to do
            });
         
         })

      })('undefined' === typeof config_.utsSheetLastUpdated
            || memory_.utsLastSaved < config_.utsSheetLastUpdated);


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

   var updateToggleConditionalFormatRule_ = function (toggle)
      {
      var rule = getConditionalFormatRuleByArea(toggle.r, toggle.c, 1, toggle.w);
      if (!Util_isObject(rule))
         {
         self_.Warn('conditional format rule for toggle could not be updated', toggle);
         return;
         }
      var builder = rule.gasConditionalFormatRule.copy();
      builder.whenFormulaSatisfied("=EQ(" + GAS_A1AddressFromCoordinatesP(toggle.r, toggle.c) +(toggle.valueCached?',FALSE)':',TRUE)'));
      rule.gasConditionalFormatRule = builder.build();
      writeConditionalFormatRules();
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadToggle = function (name)
      {
      try
         {
         var toggle = memory_.toggleFromName[name];
         if (!toggle.hasOwnProperty('valueCached'))
            {
            toggle.valueCached = !!sheet_.getRange(toggle.r, toggle.c).getValue();
            }
         if (!toggle.hasOwnProperty('fRuleIsSynced'))
            {
            updateToggleConditionalFormatRule_(toggle);
            toggle.fRuleIsSynced = null;
            }
         return toggle.valueCached;
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

         value = !!value;

         if (memory_.toggleFromName.hasOwnProperty(name))
            {
            var toggle = memory_.toggleFromName[name];
            }
         else 
            {
            var toggle = memory_.toggleFromName[name] = {
                  fVirtual: null,
                  fRuleIsSynced: null
                  };
            }
         if (toggle.hasOwnProperty('fVirtual'))
            {
            toggle.valueCached = value;
            }
         else
            {
            delete toggle.fRuleIsSynced;
            var checkboxRange = sheet_.getRange(toggle.r, toggle.c, 1, 1);
            if (toggle.isReadonly)
               {
               checkboxRange.setFormula(value ? '=TRUE' : '=FALSE');
               }
            else
               {
               checkboxRange.setValue(value);
               }
            toggle.valueCached = value;
            updateToggleConditionalFormatRule_(toggle);
            toggle.fRuleIsSynced = null;
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

   var updateFieldConditionalFormatRule_ = function (field)
      {
      var rule = getConditionalFormatRuleByArea(field.r, field.c, field.h, field.w);
      if (!Util_isObject(rule))
         {
         self_.Warn('conditional format rule for field could not be updated', field);
         return;
         }
      var builder = rule.gasConditionalFormatRule.copy();
      builder.whenTextEqualTo(field.valueCached);
      rule.gasConditionalFormatRule = builder.build();
      sheet_.setConditionalFormatRules(conditionalFormatRules_.map(function (e) { return e.gasConditionalFormatRule; }));
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.ReadField = function (name)
      {
      try
         {
         var field = memory_.fieldFromName[name];
         if (!field.hasOwnProperty('valueCached'))
            {
            field.valueCached = String(sheet_.getRange(field.r, field.c).getValue());
            }
         if (!field.hasOwnProperty('fRuleIsSynced'))
            {
            updateFieldConditionalFormatRule_(field);
            field.fRuleIsSynced = null;
            }
         return field.valueCached;
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
         value = String(value);
         if (memory_.fieldFromName.hasOwnProperty(name))
            {
            var field = memory_.fieldFromName[name];
            }
         else 
            {
            var field = memory_.fieldFromName[name] = {
                  fVirtual: null,
                  fRuleIsSynced: null
                  };
            }
         if (field.hasOwnProperty('fVirtual'))
            {
            field.valueCached = value;
            }
         else
            {
            delete field.fRuleIsSynced;
            sheet_.getRange(field.r, field.c, field.h, field.w)
                  .setValue(value);
            field.valueCached = value;
            updateFieldConditionalFormatRule_(field);
            field.fRuleIsSynced = null;
            }
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
         if (!note.hasOwnProperty('valueCached'))
            {
            note.valueCached = String(sheet_.getRange(note.r, note.c).getNote());
            }
         return note.valueCached;
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
         if (memory_.noteFromName.hasOwnProperty(name))
            {
            var note = memory_.noteFromName[name];
            }
         else 
            {
            var note = memory_.noteFromName[name] = {
                  fVirtual: null
                  };
            }
         if (!note.hasOwnProperty('fVirtual'))
            {
            sheet_.getRange(note.r, note.c)
                  .setNote(value);
            }
         note.valueCached = value;
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
      if (!isThisOn_)
         {
         return sheet_.getRange(1, 49);
         }
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
      var newConfig = JSON.parse(JSON.stringify(config_));
      newConfig.memory.utsLastSaved = 0;  // eliminate all caches
      var rvAgent = new Agent(sheet_, newConfig)
      sheet_ = null;
      config_ = null;
      memory_ = null;
      return rvAgent;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.Save = function ()
      {
      if (!isThisOn_) throw "not turned on";
      memory_.utsLastSaved = config_.utsNow;
      PropertiesService.getDocumentProperties().setProperty('platycoreAgent' + self_.getSheetId(), JSON.stringify(memory_));
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
      PropertiesService.getDocumentProperties().deleteProperty('platycoreAgent' + self_.getSheetId());
      sheet_.getParent().deleteSheet(sheet_);
      sheet_ = null;
      return memory_;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.TurnOn = function ()
      {
      if (isThisOn_)
         {
         return true;
         }
      var sentinel = Utilities.base64Encode(Math.random().toString());
      var sentinelRange = sheet_.getRange(1, 49);
      sentinelRange.setValue(sentinel);
      var lock = LockService.getDocumentLock();
      if (!lock.tryLock(config_.dtLockWaitMillis))
         {
         console.warn('lock prevented turnOn');
         return false;
         }
      try
         {
         var onValue = self_.ReadToggle('ON');
         var lockValue = self_.ReadField('LOCK');
         var tooLongSinceLastLocked = (60 *  5/*m*/+30/*s*/) * 1000 < (config_.utsNow - lockValue);
         isThisOn_ = (false === onValue || tooLongSinceLastLocked) && sentinel === sentinelRange.getValue();
         if (isThisOn_)
            {
            if (onValue)
               {
               console.warn('previous lock on platycoreAgent' + sheet_.getSheetId() + ' aged out and is being ignored');
               }
            self_.WriteField('LOCK', config_.utsNow);
            self_.WriteToggle('ON', true);
            }
         else
            {
            console.warn('another process is currently running this agent');
            }
         }
      catch (e)
         {
         self_.Error('TurnOn', e);
         }
      finally
         {
         lock.releaseLock();
         lock = null;
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

   this.FormulaDetectingAnyChanges_GetP() = function (ignoredNames)
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
// Execute the code indicated by SI (Script Index) and BI (Block
// Index) in the agent. SI and BI can be in the sheet, virtual,
// or can simply not exist. An invalid SI causes the agent to
// run its RESET routine, and an invalid BI selects the first block.
//

   this.Step = function ()
      {
      if (!isThisOn_)
         {
         throw "must be on"
         }
      var iScriptIndex = self_.ReadArrayIndexFromField('SI', memory_.scriptNames.length);
      if (memory_.scriptNames.hasOwnProperty(iScriptIndex))
         {
         var script = scriptFromNameP_(memory_.scriptNames[iScriptIndex]);
         } 
      else
         {
         iScriptIndex = memory_.scriptNames.indexOf('RESET');
         self_.WriteField('SI', iScriptIndex);
         var script = scriptFromNameP_('RESET');
         }
      var iBlockIndex = self_.ReadArrayIndexFromField('BI', script.blockCodeNoteNames.length);
      if (!script.blockCodeNoteNames.hasOwnProperty(iBlockIndex))
         {
         iBlockIndex = 0;
         self_.WriteField('BI', iBlockIndex);
         }
      var code = self_.ReadNote(script.blockCodeNoteNames[iBlockIndex]);
      
      (function (agent)
         {
         eval(code);
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
// Anyway, the point is that it's handy for the kinds of things
// agents do to be able to schedule regular and irregular execution,
// so that's what this does.
// 
// Snoozing automatically adjusts for the unreliable cadence of
// timer execution in Google's environment. As a result, requesting
// a snooze of 60 000 milliseconds (1 minute) is the same thing as
// setting a timer that triggers every minute.
//

   this.Snooze = function (dtMilliseconds)
      {
      var dt = dtMilliseconds * 1000;
      var utsMaybePreviousWakeTime = self_.ReadField('WAKE');
      self_.Log('Util_utsNowGet()', Util_utsNowGet());
      self_.Log('config_.utsNow', config_.utsNow);
      self_.Log('utsMaybePreviousWakeTime', utsMaybePreviousWakeTime);
      var utsNewWakeTime = dt + config_.utsNow;
      // if (Util_isNumber(utsMaybePreviousWakeTime) && Math.abs(config_.utsNow - utsMaybePreviousWakeTime) < dtMilliseconds)
      //    {                                                              // Create a regular cadence. Also, coerce
      //    utsNewWakeTime = dt + parseInt(utsMaybePreviousWakeTime, 10);  // utsMaybePreviousWakeTime into being a number
      //    }                                                              // (otherwise the + can mean "string append")
      self_.Log('utsNewWakeTime', utsNewWakeTime);
      self_.Log('Snoozing asked for ' + Util_stopwatchStringFromDuration(dt) + ', alarm set for ' + Util_stopwatchStringFromDuration(utsNewWakeTime - Util_utsNowGet()) + ' from now at ', new Date(utsNewWakeTime), utsNewWakeTime);
      self_.BadgeLastOutput(Util_moonPhaseFromDate(new Date(utsNewWakeTime)));
      self_.WriteField('WAKE', utsNewWakeTime);

      delete self_.Snooze; // this function can only be called once, otherwise the field WAKE has already been written and that might do Weird Things (TM) this could be fixed perhaps in less time than it took to write this comment but I'm not sure if anyone will ever care... so, goodbye function!
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.SnoozeForever = function ()
      {
      self_.Log(Util_moonPhaseFromDate(config_.utsNow) + 'Snoozing, no alarm... ');
      self_.WriteField('WAKE', 'SNOOZE');
      };

//------------------------------------------------------------------------------------------------------------------------------------
//
//

   this.ExecuteRoutineFromUrl = function (urlAgentInstructions)
      {
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

         if ('REBOOT' === eInstruction || 'OFF' === eInstruction || iInstruction + 1 == nInstructionCount) // save the conditional formatting rules before switching off
            {
            sheet.setConditionalFormatRules(conditionalFormatRules.map(function (e) { return e.gasConditionalFormatRule; }));
            }

         switch (eInstruction)
            {
            default:
               agent.Error('invalid instruction', eInstruction);
               break;

            case 'NAME':
               var name = instructions[++iInstruction];
               memory_.name = name;
               agent.Info('Building agent "' + name + '" (platycoreAgent' + sheet.getSheetId() + ')');
               break;
            
            case 'TOOLBAR':
               var irToolbar = instructions[++iInstruction];
               sheet.getRange(irToolbar, 1, 1, 49)
                     .setBackground('#434343')
                     .setBorder(false, false, true, false, false, false, '#434343', SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
               break;

            case 'FREEZE':
               var qrFrozenRows = instructions[++iInstruction];
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
               return agent.Reboot().ExecuteRoutine(instructions.slice(iInstruction+1));

            case 'REBOOT':
               agent.Verbose(function () { return 'reboot'; });
               return agent.Reboot().ExecuteRoutine(instructions.slice(iInstruction+1));
            
            case 'VERBOSE':
               agent.Verbose(function () { return instructions[++iInstruction] });
               break;
            
            case 'OFF':
               agent.TurnOff();
               break;

            case 'INFO':
               agent.Info(instructions[++iInstruction]);
               break;

            case 'WARN':
               agent.Warn(instructions[++iInstruction]);
               break;

            case 'ERROR':
               agent.Error(instructions[++iInstruction]);
               break;

            case 'REINSTALL': // execute code if this is a reinstall operation; guarantee access to the variable previousInstallMemory
               var code = instructions[++iInstruction].join('\n');
               if (Util_isObject(previousInstallMemory))
                  {
                  (function (agent, previousInstallMemory)
                     {
                     eval(code);
                     })(agent, previousInstallMemory);
                  }
               break;

            case 'EVAL':
               var code = instructions[++iInstruction].join('\n');
               (function (agent)
                  {
                  eval(code);
                  })(agent);
               break;

            case 'RANGE':
               var rangeCommand = instructions[++iInstruction];
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
               var uninstallScript = instructions[++iInstruction].join('\n');
               memory_.uninstall = uninstallScript;
               return agent.Reboot().ExecuteRoutine(instructions.slice(iInstruction+1));

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
                  if (memory_.fieldFromName.hasOwnProperty(field.k))
                     {
                     if (!field.hasOwnProperty('value')) // borrow the value from the existing one, if necessary (this lets us make virtual into "visible" fields)
                        {
                        field.value = memory_.fieldFromName[field.k].valueCached;
                        }
                     }
                  memory_.fieldFromName[field.k] = field;
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
                  })(instructions[++iInstruction]);
               break;

            case 'GO_EN':
               (function (goen)
                  {
                  var toggles = Object.keys(memory_.toggleFromName).map(function (kName)
                     {
                     var eToggle = memory_.toggleFromName[kName];
                     return "NE(" + GAS_A1AddressFromCoordinatesP(eToggle.r, eToggle.c) + (eToggle.valueCached ? ",TRUE)" : ",FALSE)");
                     });
                  var fields = Object.keys(memory_.fieldFromName).map(function (kName)
                     {
                     var eField = memory_.fieldFromName[kName];
                     return "NE(" + GAS_A1AddressFromCoordinatesP(eField.r, eField.c) + ',"' + String(eField.valueCached).replace('"', '""') + '")';
                     });
                  var en = memory_.toggleFromName['EN'] = { r: goen.r, c: goen.c + 2, w: 2, h: 1, t: 'EN', isReadonly: false, valueCached: false };
                  var go = memory_.toggleFromName['GO'] = { r: goen.r, c: goen.c, w: 2, h: 1, t: 'GO', isReadonly: true, valueCached: false };
                  sheet.getRange(go.r, go.c).insertCheckboxes()
                        .setFormula('=AND(' + GAS_A1AddressFromCoordinatesP(en.r, en.c) + ',OR(FALSE,' + toggles.concat(fields).join(',') + '))');
                  sheet.getRange(en.r, en.c).insertCheckboxes()
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
                  })(instructions[++iInstruction]);
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
               else if (Util_isArray(value) && value.every(Util_isString(e)))
                  {
                  value = value.join('\n'); // this is an array of strings, so turn it into lines of text
                  }
               else
                  {
                  value = JSON.stringify(value);
                  }
               agent.Log('+note: ' + kName, Util_clampStringLengthP(value, 50));
               if (!note.hasOwnProperty('fVirtual'))
                  {
                  sheet.getRange(note.r, note.c).setNote(value);
                  }
               note.valueCached = value;
               break;
            
            case 'RAINBOW_BOX':
               var location = instructions[++iInstruction];
               var color = Util_rainbowColorFromAnyP(instructions[++iInstruction]);
               var value = instructions[++iInstruction];
               sheet.getRange(location.r, location.c)
                     .setVerticalAlignment('middle')
                     .setHorizontalAlignment('center')
                     .setBackground(color)
                     .setValue(value)
                     .setBorder(true, true, true, true, true, true, '#434343', SpreadsheetApp.BorderStyle.SOLID_THICK);
               break;
            
            case 'REM':
               console.log('REM ' + instructions[++iInstruction]);
               break;

            case 'SCRIPT': // SCRIPT "<name>" <qBlockCount>
               var kName = instructions[++iInstruction];
               var script = {blockCodeNoteNames:instructions[++iInstruction]};
               agent.Log('+script: ' + kName, script.blockCodeNoteNames);
               memory_.scriptFromName[kName] = script;
               memory_.scriptNames.push(kName);
               break;

            case 'TOAST':
               spreadsheet.toast(instructions[++iInstruction]);
               break;

            case 'TOGGLE':
               (function (toggle)
                  {
                  memory_.toggleFromName[toggle.k] = toggle;
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
                  })(instructions[++iInstruction]);
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
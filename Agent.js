

function Agent (sheet_, config_)
   {
   //console.log('agent coming online: ', sheet_.getName(), config_);
   var properties_ = PropertiesService.getDocumentProperties();
   var self_ = this;
   if (Util_isObjectFlagTruthy(config_, 'shouldReuseMemoryPointer')) // If the user asks for it explicitly, we can carefully
      {                                                              // preserve the memory pointer so that outside sources
      var [config_, memory_] = (function (config)                    // can continue to edit the insides of the agent. By
         {                                                           // default, agents are isolated to prevent accidents.
         if (config.hasOwnProperty('memory'))
            {
            var memory = config.memory;
            delete config.memory;
            var rvConfig = JSON.parse(JSON.stringify(config));
            rvConfig.memory = config.memory = memory;
            return [rvConfig, memory];
            }
         else
            {
            var rvConfig = JSON.parse(JSON.stringify(config));
            return [rvConfig, rvConfig.memory];
            }
         })(config_);
      }
   else
      {
      config_ = JSON.parse(JSON.stringify(config_ || {}));
      var memory_ = config_.memory;
      }
   var isThisOn_ = !!config_.forceThisOn;


//------------------------------------------------------------------------------------------------------------------------------------
//
// Apply defaults
//

   if (!config_.hasOwnProperty('dtLockWait')) config_.dtLockWait = 15000;


//------------------------------------------------------------------------------------------------------------------------------------
//
// Accessors
//

   Util_makeLazyConstantMethod(this, 'getSheetId', function () { return sheet_.getSheetId() });
   Util_makeLazyConstantMethod(this, 'isVerbose_', function () { return !!config_.verbose || self_.ReadToggle('VERBOSE') });


//------------------------------------------------------------------------------------------------------------------------------------
//
// Load memory_ for this execution (clear cache, reserved flags, etc.)
//

   if ('object' !== typeof memory_ || null === memory_)
      {
      memory_ = JSON.parse(properties_.getProperty('platycoreAgent' + this.getSheetId()));
      }

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
                     gasRange: eRange,
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
      var builder = rule.gasConditionalFormatRule.copy();
      builder.whenFormulaSatisfied("=EQ(" + GAS_A1AddressFromCoordinatesP(toggle.r, toggle.c) +(toggle.valueCached?',FALSE)':',TRUE)'));
      rule.gasConditionalFormatRule = builder.build();
      sheet_.setConditionalFormatRules(conditionalFormatRules_.map(function (e) { return e.gasConditionalFormatRule; }));
      return range;
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
         console.warn(e, e.stack);
         return undefined;
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.WriteToggle = function (name, value)
      {
      try
         {
         value = !!value;
         var toggle = memory_.toggleFromName[name];
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
         updateToggleConditionalFormatRule_(toggle, sheet_.getRange(toggle.r, toggle.c, 1, toggle.w));
         toggle.valueCached = value;
         toggle.fRuleIsSynced = null;
         }
      catch (e)
         {
         console.warn(e, e.stack);
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
         console.warn(e, e.stack);
         return undefined;
         }
      };

//------------------------------------------------------------------------------------------------------------------------------------
   
   this.WriteField = function (name, value)
      {
      try
         {
         value = String(value);
         var field = memory_.fieldFromName[name];
         delete field.fRuleIsSynced;
         sheet_.getRange(field.r, field.c, field.h, field.w)
               .setValue(value);
         field.valueCached = value;
         updateFieldConditionalFormatRule_(field);
         field.fRuleIsSynced = null;
         }
      catch (e)
         {
         console.warn(e, e.stack);
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
         console.warn(e, e.stack);
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

   this.WriteNote = function (name)
      {
      try
         {
         var note = memory_.noteFromName[name];
         sheet_.getRange(note.r, note.c).setNote(note);
         note.valueCached = value;
         }
      catch (e)
         {
         console.warn(e, e.stack);
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

   const startsFromArgCount = [[],[ 2],[ 2,21],[ 2,21,36],[ 2,21,29,40]];
   const countsFromArgCount = [[],[48],[19,29],[19,15,14],[19, 7,10, 9]];

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
      //.setValue('▪').setVerticalAlignment('middle')
      sheet_.getRange(irNewMessage_, 1).setNote(JSON.stringify([new Date().toISOString()].concat(Object.keys(args).map(function (kArg){return args[kArg]}))));
      //sheet_.setRowHeight(irNewMessage_, cellSize_);
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

   // writes debug text to the output log for this sheet
   this.Log = function (message)
      {
      console.log.apply(console, arguments);
      writeOutput_(arguments).setFontColor('#00ff00').setBackground('black');
      };

//------------------------------------------------------------------------------------------------------------------------------------

   // writes an informational message to the output log for this sheet
   this.Info = function (message)
      {
      console.info.apply(console, arguments);
      writeOutput_(arguments).setFontColor('white').setBackground('black');
      };

//------------------------------------------------------------------------------------------------------------------------------------

   // writes a warning to the output log for this sheet
   this.Warn = function (message)
      {
      console.warn.apply(console, arguments);
      writeOutput_(arguments).setFontColor('yellow').setBackground('#38340a');
      };

//------------------------------------------------------------------------------------------------------------------------------------

   // writes an error message to the output log for this sheet
   this.Error = function (message)
      {
      console.error.apply(console, arguments);
      writeOutput_(arguments).setFontColor('red').setBackground('#3d0404');
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
      if (config_.shouldReuseMemoryPointer)
         {
         delete config_.memory;
         var newConfig = JSON.parse(JSON.stringify(config_));
         newConfig.memory = memory_;
         }
      else
         {
         var newConfig = JSON.parse(JSON.stringify(config_));
         }
      newConfig.memory.utsLastSaved = 0;  // eliminate all caches
      console.log('newConfig', newConfig);
      var rvAgentAndMemory = [new Agent(sheet_, newConfig), newConfig.memory];
      sheet_ = null;
      config_ = null;
      memory_ = null;
      return rvAgentAndMemory;
      };

//------------------------------------------------------------------------------------------------------------------------------------

   this.Save = function ()
      {
      memory_.utsLastSaved = utsPlatycoreNow;
      properties_.setProperty('platycoreAgent' + self_.getSheetId(), JSON.stringify(memory_));
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
      properties_.deleteProperty('platycoreAgent' + self_.getSheetId());
      sheet_.getParent().deleteSheet(sheet_);
      sheet_ = null;
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
      if (!lock.tryLock(config_.dtLockWait))
         {
         console.warn('lock prevented turnOn');
         return false;
         }
      try
         {
         var onValue = self_.ReadToggle('ON');
         var lockValue = self_.ReadField('LOCK');
         var tooLongSinceLastLocked = (60 *  5/*m*/+30/*s*/) * 1000 < (new Date().getTime() - lockValue);
         isThisOn_ = (!onValue || tooLongSinceLastLocked) && sentinel === sentinelRange.getValue();
         if (isThisOn_)
            {
            if (onValue)
               {
               console.warn('previous lock on platycoreAgent' + sheet_.getSheetId() + ' aged out and is being ignored');
               }
            self_.WriteField('LOCK', new Date().getTime());
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
      if (lock.tryLock(config_.dtLockWait))
         {
         try
            {                                // There is only one line of content right now and
            self_.WriteToggle('ON', false);  // it doesn't throw, but it's good practice to have
            }                                // this ready to go for future teradown code.
         finally
            {
            lock.releaseLock();
            lock = null;
            }
         }
      self_.Save();
      };

//------------------------------------------------------------------------------------------------------------------------------------

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
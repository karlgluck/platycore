// agent should know when its memory was last updated
// and have the last time the sheet was changed
// then be able to know how to clear its own cache

function Agent (sheet_, utsSheetLastModified_, memory_, options_)
   {
   console.log('agent coming online: ', memory_);
   var properties_ = PropertiesService.getDocumentProperties();
   var self_ = this;
   options_ = options_ || {};
   var isThisOn_ = options_.forceThisOn;

   this.getSheetId = function ()
      {
      var rvSheetId = sheet_.getSheetId();
      self_.getSheetId = (function (rv) { return function () { return rv }})(rvSheetId);
      return rvSheetId;
      };

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

   (function (isCacheExpired)
      {

      console.log('isCacheExpired: ' + isCacheExpired, isCacheExpired);

      ['toggleFromName', 'fieldFromName'].forEach(function (kDictionary)
         {
         var eDictionary = memory_[kDictionary];
         
         Object.keys(eDictionary).forEach(function (kName)   // clear hasBeenRead from all of the interactables
            {
            var toggle = eDictionary[kName];
            delete toggle.hasBeenRead;
            if (isCacheExpired) delete toggle.valueCached;
            });
         
         })

      if (isCacheExpired) // clear valueCached from all code blocks
         {
         Object.keys(memory_.scriptFromName).forEach(function (kName)
            {
            var eScript = memory_.scriptFromName[kName];
            eScript.blocks.forEach(function (eBlock)
               {
               delete eBlock.valueCached;
               })
            })
         }


      })('undefined' === typeof utsSheetLastModified_
            || (memory_.utsLastSaved >>> 0) < (utsSheetLastModified_ >>> 0));

//   var cellSize_ = sheet_.getRowHeight(1);

   this.urlAgentInstructionsGet = function ()
      {
      return memory_.urlAgentInstructions;
      };

   this.reboot = function ()
      {
      self_.save();
      var newMemory = JSON.parse(JSON.stringify(memory_));
      newMemory.utsLastSaved = 0; // eliminate all caches
      var newOptions = JSON.parse(JSON.stringify(options_));
      return [new Agent(sheet_, utsSheetLastModified_, newMemory, newOptions), newMemory];
      };
   
   this.save = function ()
      {
      properties_.setProperty('platycoreAgent' + self_.getSheetId(), JSON.stringify(memory_));
      };
   
   this.uninstall = function ()
      {
      if (memory_.hasOwnProperty('uninstall'))
         {
         self_.verbose(function () { return [memory_.uninstall] });
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
      }

   var toggleFromNameP_ = function (name)
      {
      try
         {
         return memory_.toggleFromName[name];
         }
      catch (e)
         {
         return { hasBeenRead: true, valueCached: false, r:1, c:49, w:1, t:'' };
         }
      };

   var scriptFromNameP_ = function (name)
      {
      try
         {
         return memory_.scriptFromName[name];
         }
      catch (e)
         {
         return { blocks: [] };
         }
      };

   var scriptBlockFromNameP_ = function (name, iBlockIndex)
      {
      try
         {
         return memory_.scriptFromName[name].blocks[iBlockIndex];
         }
      catch (e)
         {
         return { valueCached: '', r:1, c:49, w:1, h:1 };
         }
      };
   
   // Each field contains:
   //    hasBeenRead - if it exists, the field has been read from its true value during this execution
   //    valueCached - 
   //
   var fieldFromNameP_ = function (name)
      {
      if (!memory_.hasOwnProperty('fieldFromName') || !memory_.fieldFromName.hasOwnProperty(name))
         {
         return { hasBeenRead: true, value: '', r:1, c:49, w:1 };
         }
      return memory_.fieldFromName[name];
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
                     gasRange: eRange,
                     }
               })
            }
      });

   var getConditionalFormatRuleByRange = function (range)
      {
      var ir = range.getRow(), ic = range.getColumn();
      for (var i = 0, n = conditionalFormatRules_.length; i < n; ++i)
         {
         var eConditionalFormatRule = conditionalFormatRules_[i];
         var ranges = eConditionalFormatRule.ranges;
         if (ranges.length === 1 && ranges[0].r === ir && ranges[0].c === ic)
            {
            return eConditionalFormatRule;
            }
         }
      return null;
      };

   this.readToggle = function (name)
      {
      var toggle = toggleFromNameP_(name);
      if (!toggle.hasOwnProperty('valueCached'))
         {
         toggle.valueCached = !!range.getValue();
         }
      if (!toggle.hasOwnProperty('hasBeenRead'))
         {
         updateToggleConditionalFormatRule_(toggle, sheet_.getRange(toggle.r, toggle.c, 1, toggle.w));
         toggle.hasBeenRead = true;
         }
      return toggle.valueCached;
      };

   this.peekToggleP = function (name)
      {
      var toggle = toggleFromNameP_(name);
      if (toggle.hasOwnProperty('valueCached'))
         {
         return toggle.valueCached;
         }
      return toggle.valueCached = !!sheet_.getRange(toggle.r, toggle.c, 1, 1).getValue();
      };

   this.writeToggle = function (name, value)
      {
      value = !!value;
      var toggle = toggleFromNameP_(name);
      delete toggle.valueCached;
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
      toggle.hasBeenRead = true;
      updateToggleConditionalFormatRule_(toggle, sheet_.getRange(toggle.r, toggle.c, 1, toggle.w));
      };

   var updateToggleConditionalFormatRule_ = function (toggle, range)
      {
      var rule = getConditionalFormatRuleByRange(range);
      var builder = rule.gasConditionalFormatRule.copy();
      builder.whenFormulaSatisfied("=EQ(" + GAS_A1AddressFromCoordinatesP(range.getRow(), range.getColumn()) +(toggle.valueCached?',FALSE)':',TRUE)'));
      rule.gasConditionalFormatRule = builder.build();
      sheet_.setConditionalFormatRules(conditionalFormatRules_.map(function (e) { return e.gasConditionalFormatRule; }));
      return range;
      };
   
   this.readField = function (name)
      {
      var field = fieldFromNameP_(name);
      if (!field.hasOwnProperty('valueCached'))
         {
         field.valueCached = String(sheet_.getRange(field.r, field.c).getValue());
         }
      if (!field.hasOwnProperty('hasBeenRead'))
         {
         updateFieldConditionalFormatRule_(field, sheet_.getRange(field.r, field.c, field.h, field.w));
         field.hasBeenRead = true;
         }
      return field.valueCached;
      };
   
   this.readFieldAsArrayIndex = function (name, mArrayLength)
      {
      var value = self_.readField(name);
      if (Util_isNumber(value))
         {
         value = value >>> 0;
         if (value > mArrayLength - 1)
            {
            return null;
            }
         return value;
         }
      else
         return null;
      };

   this.peekFieldP = function (name)
      {
      var field = fieldFromNameP_(name);
      if (!field.hasOwnProperty('valueCached'))
         {
         field.valueCached = String(sheet_.getRange(field.r, field.c).getValue());;
         }
      return field.valueCached;
      };
   
   this.writeField = function (name, value)
      {
      value = String(value);
      var field = fieldFromNameP_(name);
      field.value = value;
      field.hasBeenRead = true;
      var range = sheet_.getRange(field.r, field.c, 1, field.w);
      range.setValue(value);
      updateFieldConditionalFormatRule_(field, range);
      };

   var updateFieldConditionalFormatRule_ = function (input, range)
      {
      var rule = getConditionalFormatRuleByRange(range);
      var builder = rule.gasConditionalFormatRule.copy();
      builder.whenTextEqualTo(input.value);
      rule.gasConditionalFormatRule = builder.build();
      sheet_.setConditionalFormatRules(conditionalFormatRules_.map(function (e) { return e.gasConditionalFormatRule; }));
      };
   
   this.readScriptBlock = function (name, iBlockIndex)
      {
      var block = scriptBlockFromNameP_(name, iBlockIndex);
      if (!block.hasOwnProperty('valueCached'))
         {
         block.valueCached = String(sheet_.getRange(block.r, block.c).getNote());
         }
      return block.valueCached;
      };

   var mcColumns_ = sheet_.getMaxColumns();
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

   this.verbose = function (callback)
      {
      if (isVerbose_())
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
   
   // writes debug text to the output log for this sheet
   this.log = function (message)
      {
      console.log.apply(console, arguments);
      writeOutput_(arguments).setFontColor('#00ff00').setBackground('black');
      };
   
   // writes an informational message to the output log for this sheet
   this.info = function (message)
      {
      console.info.apply(console, arguments);
      writeOutput_(arguments).setFontColor('white').setBackground('black');
      };
   
   // writes a warning to the output log for this sheet
   this.warn = function (message)
      {
      console.warn.apply(console, arguments);
      writeOutput_(arguments).setFontColor('yellow').setBackground('#38340a');
      };

   // writes an error message to the output log for this sheet
   this.error = function (message)
      {
      console.error.apply(console, arguments);
      writeOutput_(arguments).setFontColor('red').setBackground('#3d0404');
      };

   var isVerbose_ = function ()
      {
      var rvVerbose = false;
      if (options_.hasOwnProperty('verbose'))
         {
         rvVerbose = options_.verbose;
         }
      isVerbose_ = (function (value) { return function () { return value; }})(rvVerbose);
      return rvVerbose;
      };

   this.turnOn = function ()
      {
      if (isThisOn_)
         {
         return true;
         }
      var lock = LockService.getDocumentLock();
      if (!lock.tryLock(15000))
         {
         console.warn('lock prevented turnOn');
         return false;
         }
      try
         {
         var onToggle = memory_.toggleFromName.ON;
         var onRange = sheet_.getRange(onToggle.r, onToggle.c);
         var lockField = memory_.fieldFromName.LOCK;
         var lockRange = sheet_.getRange(lockField.r, lockField.c, lockField.h, lockField.w);
         var onValue = !!onRange.getValue();
         var tooLongSinceLastLocked = (60 *  5/*m*/+30/*s*/) * 1000 < (new Date().getTime() - (lockRange.getValue() >>> 0)); // TODO: test the lock override step
         isThisOn_ = !onValue || tooLongSinceLastLocked;
         if (isThisOn_)
            {
            if (!onValue)
               {
               console.warn('previous lock on platycoreAgent' + sheet_.getSheetId() + ' aged out and is being ignored');
               }
            lockRange.setValue(lockField.value = new Date().getTime());
            onRange.setFormula('=TRUE');
            onToggle.valueCached = onValue = true;
            }
         else
            {
            console.warn('another process is currently running this agent');
            }
         }
      finally 
         {
         lock.releaseLock();
         lock = null;
         }
      return isThisOn_;
      };

   this.turnOff = function ()
      {
      self_.verbose(function () { return ['shutting down...', isThisOn_, JSON.stringify(memory_)] });
      if (!isThisOn_)
         {
         return;
         }
      isThisOn_ = false;
      var lock = LockService.getDocumentLock();
      if (lock.tryLock(15000))
         {
         try
            {
            var toggle = memory_.toggleFromName.ON;
            toggle.valueCached = false;
            sheet_.getRange(toggle.r, toggle.c, 1, 1).setFormula('=FALSE');
            }
         finally
            {
            lock.releaseLock();
            lock = null;
            }
         }
      self_.save();
      };

   this.step = function ()
      {
      if (!isThisOn_)
         {
         throw "must be on"
         }
      var iScriptIndex = self_.readFieldAsArrayIndex('SI', memory_.scriptNames.length);
      if (null === iScriptIndex)
         {
         iScriptIndex = memory_.scriptNames.indexOf('RESET');
         self_.writeField('SI', iScriptIndex);
         var script = scriptFromNameP_('RESET');
         }
      else
         {
         var script = scriptFromNameP_(memory_.scriptNames[iScriptIndex]);
         }
      var iBlockIndex = self_.readFieldAsArrayIndex('BI', script.blocks.length);
      if (null === iBlockIndex)
         {
         iBlockIndex = 0;
         self_.writeField('BI', iBlockIndex);
         }
      var block = script.blocks[iBlockIndex];
      if (!block.hasOwnProperty('valueCached'))
         {
         block.valueCached = String(sheet_.getRange(block.r, block.c).getNote());
         }
      
      (function (agent)
         {
         eval(block.valueCached);
         })(self_);
      
      };

   this.setNext = function (scriptName)
      {
      };
   
   this.reset = function ()
      {
      if (!isThisOn_)
         {
         throw "must be on"
         }
      self_.readScript()
      };

   }
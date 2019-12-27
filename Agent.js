

function Agent (sheet_, memory_, options_)
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

   if ('object' !== typeof memory_ || null === memory_)
      {
      memory_ = JSON.parse(properties_.getProperty('platycoreAgent' + this.getSheetId()));
      }

   var cellSize_ = sheet_.getRowHeight(1);

   this.urlAgentInstructionsGet = function ()
      {
      return memory_.urlAgentInstructions;
      };

   this.reboot = function ()
      {
      properties_.setProperty('platycoreAgent' + self_.getSheetId(), JSON.stringify(memory_));
      var newMemory = JSON.parse(JSON.stringify(memory_));
      var newOptions = JSON.parse(JSON.stringify(options_));
      return [new Agent(sheet_, newMemory, newOptions), newMemory];
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
      if (!memory_.hasOwnProperty('toggleFromName') || !memory_.toggleFromName.hasOwnProperty(name))
         {
         return { hasBeenRead: true, isOn: false, r:1, c:49, w:1, t:'' };
         }
      return memory_.toggleFromName[name];
      };
   
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
         if (eRanges.length === 1 && eConditionalFormatRule.ranges[0].r === ir && eConditionalFormatRule.ranges[0].c === ic)
            {
            return eConditionalFormatRule;
            }
         }
      return null;
      };

   this.readToggle = function (name)
      {
      var toggle = toggleFromNameP_(name);
      if (!toggle.hasOwnProperty('isOn'))
         {
         toggle.isOn = !!range.getValue();
         }
      if (!toggle.hasOwnProperty('hasBeenRead'))
         {
         updateToggleConditionalFormatRule_(toggle, sheet_.getRange(toggle.r, toggle.c, 1, toggle.w));
         }
      toggle.hasBeenRead = true;
      return toggle.isOn;
      };

   this.peekToggleP = function (name)
      {
      var toggle = toggleFromNameP_(name);
      if (toggle.hasOwnProperty('isOn'))
         {
         return toggle.isOn;
         }
      return toggle.isOn = !!sheet_.getRange(toggle.r, toggle.c, 1, 1).getValue();
      };

   this.writeToggle = function (name, isOn)
      {
      isOn = !!isOn;
      var toggle = toggleFromNameP_(name);
      toggle.isOn = isOn;
      toggle.hasBeenRead = true;
      var checkboxRange = sheet_.getRange(toggle.r, toggle.c, 1, 1);
      if (toggle.isReadonly)
         {
         checkboxRange.setFormula(isOn ? '=TRUE' : '=FALSE');
         }
      else
         {
         checkboxRange.setValue(isOn);
         }
      updateToggleConditionalFormatRule_(toggle, sheet_.getRange(toggle.r, toggle.c, 1, toggle.w));
      };

   var updateToggleConditionalFormatRule_ = function (toggle, range)
      {
      var rule = getConditionalFormatRuleByRange(range);
      var builder = rule.copy();
      builder.whenFormulaSatisfied("=EQ(" + GAS_A1AddressFromCoordinatesP(range.getRow(), range.getColumn()) +(toggle.isOn?',TRUE)':',FALSE)'));
      rule.gasConditionalFormatRule = builder.build();
      sheet_.setConditionalFormatRules(conditionalFormatRules_.map(function (e) { return e.gasConditionalFormatRule; }));
      return range;
      };
   
   this.readField = function (name)
      {
      var field = fieldFromNameP_(name);
      if (!field.hasOwnProperty('value'))
         {
         field.value = String(sheet_.getRange(field.r, field.c).getValue());
         }
      if (!field.hasOwnProperty('hasBeenRead'))
         {
         updateFieldConditionalFormatRule_(field, sheet_.getRange(field.r, field.c, field.h, field.w));
         }
      field.hasBeenRead = true;
      return field.value;
      };

   this.peekFieldP = function (name)
      {
      var toggle = fieldFromNameP_(name);
      if (field.hasOwnProperty('value'))
         {
         return field.value;
         }
      return toggle.isOn = !!sheet_.getRange(toggle.r, toggle.c, 1, 1).getValue();
      };
   
   this.writeField = function (name, value)
      {
      value = String(value);
      var field = fieldFromNameP_(name);
      field.value = value;
      field.hasBeenRead = true;
      var range = sheet_.getRange(toggle.r, toggle.c, 1, toggle.w);
      range.setValue(isOn);
      updateFieldConditionalFormatRule_(toggle, range);
      };

   var updateFieldConditionalFormatRule_ = function (input, range)
      {
      var rule = getConditionalFormatRuleByRange(range);
      var builder = rule.copy();
      builder.whenTextEqualTo(input.value);
      rule.gasConditionalFormatRule = builder.build();
      sheet_.setConditionalFormatRules(conditionalFormatRules_.map(function (e) { return e.gasConditionalFormatRule; }));
      };

   var mcColumns_ = sheet_.getMaxColumns();
   var irNewMessage_ = sheet_.getFrozenRows() + 1;

   var writeOutputFirstTime_ = function (args)
      {
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
         var notTooLongSinceLastLocked = true; // TODO
         var isOn = !!onRange.getValue() && (notTooLongSinceLastLocked);
         isThisOn_ = !isOn;
         if (isThisOn_)
            {
            // set the value of the LAST field to the current date
            lockRange.setValue(lockField.value = new Date().getTime());
            onToggle.isOn = isOn = true;
            onRange.setFormula('=TRUE');
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
            toggle.isOn = false;
            sheet_.getRange(toggle.r, toggle.c, 1, 1).setFormula('=FALSE');
            }
         finally
            {
            lock.releaseLock();
            lock = null;
            }
         }
      properties_.setProperty('platycoreAgent' + self_.getSheetId(), JSON.stringify(memory_));
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

   }
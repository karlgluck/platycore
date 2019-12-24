
function Agent (sheet_, options_)
   {
   var self_ = this;
   options_ = options_ || {};

   var metadataFromKey_ = {};

   this.reboot = function ()
      {
      return new Agent(sheet_, options_);
      };
   
   this.uninstall = function ()
      {
      if (metadataFromKey_.hasOwnProperty('uninstall'))
         {
         self_.verbose(function () { return [metadataFromKey_.uninstall] });
         try
            {
            eval(metadataFromKey_.uninstall);
            }
         catch (e)
            {
            }
         }
      sheet_.getParent().deleteSheet(sheet_);
      sheet_ = null;
      }

   this.writeMetadata = function (key, value)
      {
      sheet_.addDeveloperMetadata(key, JSON.stringify(value));
      };

   var toggleFromNameP_ = function (name)
      {
      if (!metadataFromKey_.hasOwnProperty('toggleFromName') || !metadataFromKey_.toggleFromName.hasOwnProperty(name))
         {
         return { hasBeenRead: true, isOn: false };
         }
      return metadataFromKey_.toggleFromName[name];
      };
   
   var inputFromNameP_ = function (name)
      {
      if (!metadataFromKey_.hasOwnProperty('inputFromName') || !metadataFromKey_.inputFromName.hasOwnProperty(name))
         {
         return { hasBeenRead: true, value: '' };
         }
      return metadataFromKey_.inputFromName[name];
      };

   var syncToggle_ = function (toggle, range)
      {
      range.setBackground(toggle.isOn ? (toggle.onColor || '#00ff00') : (toggle.offColor || '#000000')).setFontColor(toggle.isOn ? (toggle.offColor || '#000000') : (toggle.onColor || '#00ff00'));
      return range;
      };

   var conditionalFormatRules_ = sheet_.getConditionalFormatRules().map(function (eRule)
      {
      eRule.gasConditionalFormatRule = eRule;
      eRule.ranges = eRule.getRanges().map(function (eRange)
         {
         return {
            r: eRange.getRow(),
            c: eRange.getColumn(),
            gasRange: eRange,
         }
         })
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
      }

   var syncInput_ = function (input, range)
      {
      var rule = getConditionalFormatRuleByRange (range);
      var builder = rule.copy();
      builder.whenTextEqualTo(input.value);
      rule.gasConditionalFormatRule = builder.build();
      sheet_.setConditionalFormatRules(conditionalFormatRules_.map(function (e) { return e.gasConditionalFormatRule; }));
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
         syncToggle_(toggle, sheet_.getRange(toggle.r, toggle.c, 1, toggle.w));
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
      if (toggle.hasOwnProperty('isOn'))
         {
         if (toggle.isOn === isOn)
            {
            return;
            }
         }
      toggle.isOn = isOn;
      sheet_.getRange(toggle.r, toggle.c, 1, 1).setValue(isOn);
      syncToggle_(toggle, sheet_.getRange(toggle.r, toggle.c, 1, toggle.w));
      };
   
   this.readInput = function (name)
      {
      var input = inputFromNameP_(name);
      if (!input.hasOwnProperty('value'))
         {
         input.value = String(sheet_.getRange(input.r, input.c).getValue());
         }
      if (!input.hasOwnProperty('hasBeenRead'))
         {
         syncInput_(input, sheet_.getRange(input.r, input.c, input.h, input.w));
         }
      input.hasBeenRead = true;
      return input.value;
      };

   var mcColumns_ = sheet_.getMaxColumns();
   var irNewMessage_ = sheet_.getFrozenRows() + 1;

   this.getMetadata = function () {
      return JSON.stringify(metadataFromKey_);
   };

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
         writeOutput_(output).setFontColor('#b6d7a8').setBackground('black');
         }
      };
   
   // writes debug text to the output log for this sheet
   this.log = function (message)
      {
      console.log(arguments);
      writeOutput_(arguments).setFontColor('#00ff00').setBackground('black');
      };
   
   // writes an informational message to the output log for this sheet
   this.info = function (message)
      {
      console.info(arguments);
      writeOutput_(arguments).setFontColor('white').setBackground('black');
      };
   
   // writes a warning to the output log for this sheet
   this.warn = function (message)
      {
      console.warn(arguments);
      writeOutput_(arguments).setFontColor('yellow').setBackground('#38340a');
      };

   // writes an error message to the output log for this sheet
   this.error = function (message)
      {
      console.error(arguments);
      writeOutput_(arguments).setFontColor('red').setBackground('#3d0404');
      };

   this.turnOn = function (timeoutInMillis)
      {
      if (isThisOn_)
         {
         return true;
         }
      var lock = LockService.getDocumentLock();
      lock.waitLock(timeoutInMillis || 1000);
      var toggle = toggleFromNameP_('ON');
      var range = sheet_.getRange(toggle.r, toggle.c, 1, toggle.w);
      var notTooLongSinceLastLocked = true;
      var isOn = !!range.getValue() && (notTooLongSinceLastLocked);
      var isThisOn_ = !isOn;
      if (isThisOn_)
         {
         toggle.isOn = true;
         sheet_.getRange(toggle.r, toggle.c, 1, 1).setValue(true);
         syncToggle_(toggle, range);
         }
      lock.releaseLock();
      return isThisOn_;
      };

   this.turnOff = function (timeoutInMillis)
      {
      if (!isThisOn_)
         {
         return;
         }
      isThisOn_ = false;
      var lock = LockService.getDocumentLock();
      if (lock.tryLock(timeoutInMillis || 10000))
         {
         var toggle = toggleFromNameP_('ON');
         var range = sheet_.getRange(toggle.r, toggle.c, 1, 1);
         toggle.isOn = false;
         sheet_.getRange(toggle.r, toggle.c, 1, 1).setValue(false);
         syncToggle_(toggle, range);
         }
      };

   var isVerbose_ = function ()
      {
      return true;
      var rvVerbose = false;
      if (options_.hasOwnProperty('verbose'))
         {
         rvVerbose = options_.verbose;
         }
      isVerbose_ = (function (value) { return function () { return value; }})(rvVerbose);
      return rvVerbose;
      };

   sheet_.getDeveloperMetadata().forEach(function (eMetadata)
      {
      var k = eMetadata.getKey(), v = eMetadata.getValue();
      metadataFromKey_[k] = JSON.parse(v);
      self_.verbose(function () { return ['metadata: ' + k + ' ', Util_clampStringLengthP(v.substring(0, 50))] });
      });
   
   if (!metadataFromKey_.hasOwnProperty('platycoreAgent'))
      {
      throw "not a platycore agent sheet";
      }

   var isOn_ = self_.peekToggleP('ON');
   var isThisOn_ = !!options_.forceThisOn;


   }
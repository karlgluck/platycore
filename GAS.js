
GAS_deleteTriggerByName = function (functionName)
   {
   var triggers = ScriptApp.getProjectTriggers();
   for (var iTrigger = triggers.length - 1; iTrigger >= 0; --iTrigger)
      {
      var eTrigger = triggers[iTrigger];
      if (eTrigger.getHandlerFunction() == functionName)
         {
         ScriptApp.deleteTrigger(eTrigger);
         }
      }
   }
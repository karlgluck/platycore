function platycoreScheduler(go)
   {
   if (!go) return 'GO';
   var sentinelTriggers = ScriptApp.getProjectTriggers().filter(function (eTrigger) { return eTrigger.getHandlerFunction() === 'triggerPlatycoreSentinel' });
   if (sentinelTriggers >= 3) return 'G'+sentinelTriggers.length;
   ScriptApp.newTrigger('triggerPlatycoreSentinel')
      .timeBased()
      .after(200)
      .create();
   return 'G'+sentinelTriggers.length;
   }
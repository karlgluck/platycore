function platycoreScheduler(go)
   {
   if (!go) return 'GO';
   var sentinelTriggers = ScriptApp.getProjectTriggers();
   if (sentinelTriggers >= 3) return 'G'+sentinelTriggers.length;
   ScriptApp.newTrigger('triggerPlatycoreSentinel')
      .timeBased()
      .after(200)
      .create();
   return 'G'+sentinelTriggers.length;
   }
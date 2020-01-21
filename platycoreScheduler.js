function platycoreScheduler(go)
   {
   // if (!go) return 'GO';
   var sentinelTriggers = ScriptApp.getProjectTriggers();
   // if (sentinelTriggers >= 3) return 'G'+sentinelTriggers.length;
   // ScriptApp.newTrigger('triggerBlockPump')
   //    .timeBased()
   //    .after(1000)
   //    .create();
   return 'G'+sentinelTriggers.length;
   }
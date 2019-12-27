function platycoreScheduler(go)
   {
   if (!go) return 'GO';
   var qTriggers = ScriptApp.getProjectTriggers().length;
   if (qTriggers > 5) return 'GO';
   ScriptApp.newTrigger('triggerPlatycoreSentinel')
      .timeBased()
      .after(200)
      .create();
   return 'GO'
   }
function menuRunSentinel ()
   {
   try
      {
      //
      // also, make the following true (and document):
      //    - the platycore sentinel runs all steps using a single time
      //        reference in "Global_utsPlatycoreNow"
      //    - for every GO or WAKE-able agent, in sequence,
      //        the sentinel will turn on, Step and turn off the agent
      //    - the sentinel will execute until either:
      //          A. The total execution time is such that stepping another
      //             agent is too likely to get cut off by Google.
      //                - print warnings if an agent uses more than 75%
      //                   of the buffer zone normally left.
      //          B. No agent is WAKE-able or can GO
      //    - if the first situation occurs, the sentinel will reschedule
      //      itself as soon as possible in the future
      //    - if the second situation occurs, the sentinel will reschedule
      //      itself at the earliest time among all snooze alarms for all agents


      // cherries:
      //    - total execution time for each agent is saved as 'ONLINE'

      GAS_deleteTriggerByName('triggerPlatycoreSentinel');
      triggerPlatycoreSentinel();
      SpreadsheetApp.getActiveSpreadsheet().toast('There are now ' + (ScriptApp.getProjectTriggers().length) + ' active trigger(s)');
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
function menuRunSelectedNote ()
   {
   platycoreVerifyPermissions();
   try
      {
      var cellRange = SpreadsheetApp.getCurrentCell();
      var agent = new Agent(cellRange.getSheet());
      try
         {
         if (agent.Preboot() && agent.TurnOn())
            {
            var noteName = agent.FindNameUsingRangeP(cellRange);
            if (null !== noteName)
               {
               agent.ExecuteRoutineByName(noteName);
               }
            else
               {
               var routine = cellRange.getNote();
               var cellRangeA1Notation = cellRange.getA1Notation();
               agent.Warn(cellRangeA1Notation + ' is not a named NOTE known to the Agent; executing directly:', routine);
               agent.ExecuteRoutineFromText(routine);
               }
            }
         }
      catch (e)
         {
         agent.Error('Run selected note', e, e.stack);
         }
      finally
         {
         agent.TurnOff();
         }
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
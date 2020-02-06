function menuRunSelectedNote ()
   {
   platycoreVerifyPermissions();
   try
      {
      var cellRange = SpreadsheetApp.getCurrentCell();
      var agent = new Agent(cellRange.getSheet(), {origin:'menuRunSelectedNote'});
      try
         {
         if (agent.TurnOn())
            {
            var noteName = agent.FindNoteNameFromRangeP(cellRange);
            if (null !== noteName)
               {
               agent.EvalNoteByName(noteName);
               }
            else
               {
               var code = cellRange.getNote();
               var cellRangeA1Notation = cellRange.getA1Notation();
               agent.Warn(cellRangeA1Notation + ' is not a named NOTE known to the Agent; executing code directly:', code);
               agent.EvalCode(code, cellRangeA1Notation);
               }
            }
         }
      catch (e)
         {
         agent.Error('Run Selected Node', e, e.stack);
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
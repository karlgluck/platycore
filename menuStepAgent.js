
function menuStepAgent()
   {
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet(), {origin:'menuStepAgent'});
      if (agent.TurnOn())
         {
         try
            {
            agent.Step();
            }
         finally
            {
            agent.TurnOff();
            }
         }
      }
   catch (e)
      {
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      try
         {
         agent.error('menuStepAgent', e, e.stack);
         }
      catch (ignore)
         {
         console.error('menuStepAgent',e, e.stack);
         }
      }
   }
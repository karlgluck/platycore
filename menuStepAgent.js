
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
         catch (e)
            {
            agent.Error('Step', e, e.stack);
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
      }
   }
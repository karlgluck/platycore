
function menuStepAgent()
   {
   var agent = new Agent(SpreadsheetApp.getActiveSheet(), {origin:'menuStepAgent'});
   try
      {
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
      console.error('menuStepAgent', e, e.stack);
      SpreadsheetApp.getActiveSpreadsheet().toast(e + ' ' + e.stack);
      }
   }
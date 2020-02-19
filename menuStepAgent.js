
function menuStepAgent()
   {
   try
      {
      var agent = new Agent(SpreadsheetApp.getActiveSheet());
      if (agent.Preboot())
         {
         try
            {
            if (agent.TurnOn())
               {
               agent.Step();
               }
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
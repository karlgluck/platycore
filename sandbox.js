
/*

each Sheet creates an API endpoint with its sheet ID as the key
the API endpoint is
   ?api=sheet&sheetId=<id>
The commands available are all via POST requests
A GET request for the sheet will just return the sheet's data as a JSON blob
in a format that depends on what kind of sheet it is (key/value store, table, etc.)

// Each Agent also creates an API endpoint with its AgentID (sheet ID) as the key
//   ?api=agent&agentId=<id>
// Commands are forwarded through internally to the sheet
// To invoke a routine for interaction via JSON, specify &routine=<ROUTINE> 
// To invoke a routine to generate a webpage via HTML, specify &page=<ROUTINE>
// All parameters get forwarded to routine in the WEB_POSTVARS and WEB_GETVARS variables of
// the agent.

// (so that I can use this project to control the watering outside)
// also to run Soundscape... the ability to provide a web interface that can
// upload and download files, and interact with a database...



 ==== HARDENING PHASE RIGHT NOW === WOOP WOOP ======

- randomly generate scripts
- test all operations to see if they break shit
- boil down ideas and delete loose ends so we have a fresh slate



I can totally make it so that you have access to the previous installation's
memory when you are re-installing -- this gives platycore the ability to
have built-in support for upgrading agents AND swapping agents in-place
within a live system (uninstall old agent, "reinstall" new agent, new agent has
code to detect alternate memory source for data)



record all messages during execution and save them into the properties memory
   - YOU CAN ALWAYS QUERY LAST EXECUTION'S OUTPUT FOR ANY DATA YOU WANT
   - ...and this is actually the preferred method of passing data from one execution to the next
   -  because it makes internal state visible and disentangles the platycore agent's data
         from the platycore's data



ALSO make sure that EVERYTHING cleans up after itself on its output:
- that way we can rely on the system scaling when it is running automatically "forever"
 with nobody looking at it
 - you are responsible for your "trash"
   --> I'm looking at YOU, agent.Log! -- where does this get cleaned up?

   I think agent logs get trimmed by another guess-scheduled longer-running job 

also, use the FCC rule: functions should accept whatever noise is provided to them and not produce noise themselves


*/


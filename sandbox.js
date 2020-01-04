
/*
Breaker schedule: if something fails, try again in periods increasing by 1.2x the time each period- use metadata to track, reset if sheet changes (to try all again). This effect only occurs when entirely in automation  mode

// each Sheet creates an API endpoint with its sheet ID as the key
// the API endpoint is
//    ?api=sheet&sheetId=<id>
// The commands available are all via POST requests
// A GET request for the sheet will just return the sheet's data as a JSON blob
// in a format that depends on what kind of sheet it is (key/value store, table, etc.)

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

// Sheet configuration is stored in platycore.

// query gmail using query (karlgluck + anything @ gmail.com, newer than [last time updated])
// forward to channel

// the platycore channel for the main matrix 

// channels exist for every Sheet
// additional channels exist
   // they can be created implicitly!!
   // they can be virtual...
   // if they are not virtual, they are in a sheet
   // platycore can make channels virtual or not (swap back and forth) 
// all channel to agent wake-pairs are stored in a sheet managed using GAS_SheetMatrix

function GAS_SheetKeyValueStore ()
   {
   // can remove old keys (to help garbage collection)
   }

function GAS_SheetTable ()
   {
   // append or replace modes
   // can remove old keys (to help garbage collection)
   }

// used to interface with the sheet as A+B=C
function GAS_SheetMatrix ()
   {
   // can remove old keys (to help garbage collection)
   }

 ==== HARDENING PHASE RIGHT NOW === WOOP WOOP ======

- randomly generate scripts
- test all operations to see if they break shit
- boil down ideas and delete loose ends so we have a fresh slate


- be able to set next SI / BI
- be able to set a 'wake timer'

- make the "list as an email contact" agent

- deploy this to Treehouse



I can totally make it so that you have access to the previous installation's
memory when you are re-installing -- this gives platycore the ability to
have built-in support for upgrading agents AND swapping agents in-place
within a live system (uninstall old agent, "reinstall" new agent, new agent has
code to detect alternate memory source for data)




to be built later!

record all messages during execution and save them into the properties memory
   - YOU CAN ALWAYS QUERY LAST EXECUTION'S OUTPUT FOR ANY DATA YOU WANT
   - ...and this is actually the preferred method of passing data from one execution to the next
   -  because it makes internal state visible and disentangles the platycore agent's data
         from the platycore's data

this is how you forward data from one execution to another! You just write it
to the agent, then ask the agent for it back later!

   agent.write('foo',{bar:'baz'});
      
      --> writes into the agent's cache and outputs to the 

   agent.read('foo')
   
      --> 




00ffff (cyan) is the "you can mess with this" color


I switched to using ff00ff (pink) as the "something is different" color
We now also have a few required flags:
   GO - does this agent need to run?
   EN - is this agent enabled?
   IN - has an input been changed?
   ON - is this agent running now? (used to make a sheet mutex, readonly)
And a required field:
   LAST - Timestamp at which the agent was last accessed, mostly
          so that we can use the field information from DocumentProperties
          rather than having to query from the sheet every single
          time the script runs. That dramatically lowers our number
          of calls to the google API.

all toggles and fields can be readonly or not
   normal text color is green-on-black, unless you specify otherwise
   readonly fields are grayed out a little, unless you specify a foreground color
   when a toggle or field is changed, the text turns pink
      - for a toggle, this is a conditional expression turning on to apply pink font color
      - for a field, this is a conditional expression that turned the font normal-color turning off
         this is because there is only a condition for matching text, where we need one for
         whenever the text doesn't match

need to make:
   (1) the data-storage sheet API
         data queue: data persists for a period of time after which it will be deleted; each
               consumer can query for only new data
   (2) the change notification network (how does "IN" get set for a sheet?)


so from here, we move into expanding the "language" of the agent build script:
- add the ability to add input boxes
- create the output connection sheet specification and style
      (round-robin, broadcast, replace table, append row (incl retention policy), set value in key-value store, etc.)
- change notifications going "down the pipe" -- how do these get queued?

ALSO make sure that EVERYTHING cleans up after itself on its output:
- that way we can rely on the system scaling when it is running automatically "forever"
 with nobody looking at it
 - you are responsible for your "trash"
   --> I'm looking at YOU, agent.Log! -- where does this get cleaned up?

   I think agent logs get trimmed by another guess-scheduled longer-running job 

also, use the FCC rule: functions should accept whatever noise is provided to them and not produce noise themselves


*/



/*

next tasks are:
- run executables!
- empty cell in SI or BI causes RESET, which runs the RESET block
- 
- channels





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


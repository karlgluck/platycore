
/*

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
   (2) the change notification network


so from here, we move into expanding the "language" of the agent build script:
- add the ability to add input boxes
- create the output connection sheet specification and style
      (round-robin, broadcast, replace table, append row (incl retention policy), set value in key-value store, etc.)
- change notifications going "down the pipe" -- how do these get queued?

ALSO make sure that EVERYTHING cleans up after itself on its output:
- that way we can rely on the system scaling when it is running automatically "forever"
 with nobody looking at it
 - you are responsible for your "trash"
   --> I'm looking at YOU, agent.log! -- where does this get cleaned up?

   I think agent logs get trimmed by another guess-scheduled longer-running job 

also, use the FCC rule: functions should accept whatever noise is provided to them and not produce noise themselves


*/


# Platycore
It's a platform and the core of an application framework. Extensible, but resistant to magic.

This is basically a Huginn (github.com/huginn/huginn) for a Google Spreadsheet. An "agent" is a sheet with configuration up top and a debugging log down below. "Agents" communicate by through "channels", which are also data stored in sheets.

Why am I working on this? Well I want to automate my todo list, recruiter list, watch list, play list, shopping list, weight tracker, workout tracker, money / savings trackers, 1:1 trackers, friend hangout time trackers, holiday reminders, gift lists, idea lists, a bot that finds and buys things for me randomly on the internet, fill out websites showing the projects that I'm working on, find interesting articles for me to read and forward them, and ALL SORTS of other interesting and vaguely automatable tasks that could plug into a nice infrastructure.

So why not let Google take care of the infrastructure part and Github take care of the code sharing part?

Then I can get back to the work I was supposed to be doing...

But more efficiently this time!


# Agent Properties

Agents save a bunch of stuff in their memory. There are a lot to remember, so here's a few of 'em:

| Property | Description |
| --------:| ----------- |
|`fieldFromName`|Dictionary turning a field name like "LOCK" into a field description|

## Field Description

| Property | Description |
| --------:| ----------- |
|`fVirtual`|A flag (its presence or absence indicates true/false). If this property exists, the field is not written to the spreadsheet anywhere, and the members `r`,`c`,`w`, and `h` will not be present|
|`fRuleIsSynced`|A flag (its presence or absence indicates true/false). If this property exists, the field's conditional formatting rule used to indicate unrecognized changes to the user has not been synced with its current value. This can be either because the field has not been read yet (so we don't know if the user has changed something) or the field was written, but an error caused the rule not to update. This flag should always be set if the field is virtual|
|`r`|First row of the range to which this field is synced. Does not exist if this is a virtual field.|
|`c`|First column of the range to which this field is synced. Does not exist if this is a virtual field.|
|`w`|Column width of the range to which this field is synced. Does not exist if this is a virtual field.|
|`h`|Row height of the range to which this field is synced. Does not exist if this is a virtual field.|

# Truthiness

Here's some other stuff that's also true!
 * Green means output
 * Cyan means editable
 * Magenta means changed
 * Dark gray (text) means readonly value
 * Colored box with dark gray border means code

- For every `GO` or `WAKE`-able agent, in sequence, the sentinel will `TurnOn`, `Step` and `TurnOff` the agent
- The sentinel will execute until either:
      A. The total execution time is such that stepping another
         agent is too likely to get cut off by Google.
            - print warnings if an agent uses more than 75%
               of the buffer zone normally left.
      B. No agent is WAKE-able or can GO
- if the first situation occurs, the sentinel will reschedule
   itself as soon as possible in the future
- if the second situation occurs, the sentinel will reschedule
   itself at the earliest time among all snooze alarms for all agents
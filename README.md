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

## `fieldFromName` Field Description

| Property | Description |
| --------:| ----------- |
|`fVirtual`|A flag (its presence or absence indicates true/false). If this property exists, the field is not written to the spreadsheet anywhere, and the members `r`,`c`,`w`, and `h` will not be present|
|`fRuleIsSynced`|A flag (its presence or absence indicates true/false). If this property exists, the field's conditional formatting rule used to indicate unrecognized changes to the user has not been synced with its current value. This can be either because the field has not been read yet (so we don't know if the user has changed something) or the field was written, but an error caused the rule not to update. This flag should always be set if the field is virtual|
|`r`|First row of the range to which this field is synced. Does not exist if this is a virtual field.|
|`c`|First column of the range to which this field is synced. Does not exist if this is a virtual field.|
|`w`|Column width of the range to which this field is synced. Does not exist if this is a virtual field.|
|`h`|Row height of the range to which this field is synced. Does not exist if this is a virtual field.|

## `fieldFromName` Field Values

| Field Name | Description |
| ----------:| ----------- |
|`LOCK`|Unix Timestamp at which the agent was last accessed, mostly so that we can use the field information from DocumentProperties rather than having to query from the sheet every single time the script runs. That dramatically lowers our number of calls to the google API.|
|`WAKE`|Unix Timestamp after which the agent should be woken up and stepped. If an agent does not need to wake up on its own, this value is `SNOOZE`|
|`SI`|Script Index of which script should be executed|
|`BI`|Block Index of which block of code inside the script should be executed. Scripts are broken into multiple blocks, each of which must complete in less than the maximum execution time. Chunking work in this way allows Platycore to automatically schedule long-running processing jobs.|

## `toggleFromName` Field Values

| Toggle Name | Description |
| -----------:| ----------- |
|`EN`|Enables or disables the agent. If `false`, the agent will never execute unless manually stepped using the menu.|
|`ON`|*(Readonly*) Whether or not the agent is currently online and executing|
|`GO`|Requests that the main loop step this agent when next available due to changes in the editable properties of the agent. Whenever this flag is changed to `true` by an action on the agent's sheet, an execution will be scheduled for the near future to make sure it gets picked up.|
|`VERBOSE`|*(Optional)* If specified, the agent will use this flag to switch on or off verbose logging output.|

## `scriptFromName` Field Values

| Script Name | Description |
| -----------:| ----------- |
|`RESET`|Executed by default if nothing else is available or if a problem occurs with `SI` or `BI`|


# Truthiness

Here's some other stuff that's also true!
 * Platycore agent sheets are designed to be usable on a 1080x1920 monitor (portrait-oriented 1080p)
 * Green means output
 * Cyan means editable
 * Magenta means changed
 * Dark gray (text) means readonly value
 * Colored box with dark gray border means code
 * For every `GO` or `WAKE`-able agent, in sequence, the RunLane will `TurnOn`, `Step` and `TurnOff` the agent
 * The RunLane will execute platycore agent blocks until either:
      A. The total execution time is such that stepping another
         agent is too likely to get cut off by Google.
      B. No agent is `WAKE`-able or can `GO`
 * If the first situation occurs, the RunLane will terminate and automatically resume after the next 5-minute interval.
 * If the second situation occurs, the RunLane will reschedule
   itself at the earliest time among all snooze alarms for all agents


# Notes

Here are some ideas I'm tossing around at the moment:
 * Breaker schedule: If something fails, try again in periods increasing by 1.2x the time each period- use metadata to track, reset if sheet changes (to try all again). This effect only occurs when entirely in a RunLane.
 * Multiple agents can write to the same sheet, but only if they are in the same RunLane





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
|`agentName`|Unique ID for the agent (never changes). Used as the `PropertiesService` key to look up a JSON blob containing the agent's memory.|
|`sheetNameHint`|Current unique name of the agent's Google Sheet (use as a hint only since the user can change this!)|
|`sheetId`|Unique ID of the Google Sheet (never changes)|
|`urlAgentInstructions`|The data-url or the http url of the source of the agent's instructions.|
|`fieldFromName`|Dictionary turning a field name into a Field Description for properties that are stored as cell values|
|`scriptFromName`|Dictionary turning a script name into a Script Description for runnable code|
|`noteFromName`|Dictionary turning a note name into a Note Description for additional data on cells|
|`toggleFromName`|Dictionary turning a toggle name into a Toggle Description for checkboxes|

## `fieldFromName` Field Description

| Property | Description |
| --------:| ----------- |
|`r`|First row of the range to which this field is synced.|
|`c`|First column of the range to which this field is synced.|
|`w`|Column width of the range to which this field is synced.|
|`h`|Row height of the range to which this field is synced.|

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
|`GO`|Requests that the pump run this agent when next available.|

## `scriptFromName` Field Values

| Script Name | Description |
| -----------:| ----------- |
|`RESET`|Executed by default if nothing else is available or if a problem occurs with `SI` or `BI`|


# Truthiness

Here's some other stuff that's also true!
 * Platycore agent sheets are designed to be usable on a 1080x1920 monitor (portrait-oriented 1080p)
 * Green means output
 * Cyan means editable
 * Dark gray (text) means readonly value
 * Colored box means code
 * For every `GO` or `WAKE`-able agent, in sequence, The Pump will `TurnOn`, `Step` and `TurnOff` the Agent
 * The Pump will execute platycore agent blocks until either:
      A. The total execution time is such that stepping another
         agent is too likely to get cut off by Google.
      B. No agent is `WAKE`-able or can `GO`


# Notes

Here are some ideas I'm tossing around at the moment:
 * Breaker schedule: If something fails, try again in periods increasing by 1.2x the time each period- use metadata to track, reset if sheet changes (to try all again). This effect only occurs when entirely in a RunLane.
 * Multiple agents can write to the same sheet, but only if they are in the same RunLane





# Platycore
It's a platform and the core of an application framework. Extensible, but resistant to magic.

This is basically a Huginn (github.com/huginn/huginn) for a Google Spreadsheet. An "agent" is a sheet with configuration up top and a debugging log down below. "Agents" communicate by through "channels", which are also data stored in sheets.

Why am I working on this? Well I want to automate my todo list, recruiter list, watch list, play list, shopping list, weight tracker, workout tracker, money / savings trackers, 1:1 trackers, friend hangout time trackers, holiday reminders, gift lists, idea lists, a bot that finds and buys things for me randomly on the internet, fill out websites showing the projects that I'm working on, find interesting articles for me to read and forward them, and ALL SORTS of other interesting and vaguely automatable tasks that could plug into a nice infrastructure.

So why not let Google take care of the infrastructure part and Github take care of the code sharing part?

Then I can get back to the work I was supposed to be doing...

But more efficiently this time!

# Truthiness

Here's some other stuff that's also true!
 * Platycore agent sheets are designed to be usable on a 1080x1920 monitor (portrait-oriented 1080p)
 * Gray means output
 * Cyan means editable
 * Colored box means interactable
 * For every `GO` or `WAKE`-able agent, in sequence, The Pump will `Preboot`,`TurnOn`, `Step` and `TurnOff` the Agent
 * The Pump will execute platycore agent blocks until either:
      A. The total execution time is such that stepping another
         agent is too likely to get cut off by Google.
      B. No agent is `WAKE`-able or can `GO`


# Notes

Here are some ideas I'm tossing around at the moment:
 * Breaker schedule: If something fails, try again in periods increasing by 1.2x the time each period- use metadata to track, reset if sheet changes (to try all again). This effect only occurs when entirely in a RunLane.
 * Multiple agents can write to the same sheet, but only if they are in the same RunLane





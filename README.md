# Platycore

Platycore is basically Huginn (github.com/huginn/huginn) that runs in Google Drive. Using Google's infrastructure, it provides a minimal core platform that makes it easy to install, use, create and share chunks of automation called "agents".

# Truthiness

Here's some other stuff that's true! Documentation to come.
 * Platycore agent sheets are designed to be usable on a 1080x1920 monitor (portrait-oriented 1080p)
 * Gray means output
 * Cyan means editable
 * Colored box means interactable
 * Every sheet with an `EN`abled Agent that is `GO` or `WAKE`-able will be run by the main loop
 * The Pump will execute platycore agent blocks until either:
      A. The total execution time is such that stepping another
         agent is too likely to get cut off by Google.
      B. No agent is `WAKE`-able or can `GO`


# Notes

Here are some ideas I'm tossing around at the moment:
 * Breaker schedule: If something fails, try again with exponential backoff - use metadata to track, reset if sheet changes (to try all again)





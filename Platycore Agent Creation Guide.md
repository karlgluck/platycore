# Platycore Agent Creation Guide

## Overview
Platycore agents are defined in plain-text installer scripts using indented declarative commands. Lines without leading whitespace are comments. All executable commands must start with at least one space. Indentation level determines nesting and scope.

Multiline code blocks use `"< EVAL "---"` (or similar) where `<` triggers de-indentation: the parser trims the exact leading whitespace count from the `<` line on all subsequent lines until the closing `---`.

## Architecture Principles

**CRITICAL:** Platycore agents follow strict architectural rules:

1. **Never use direct sheet access on the agent sheet**
   - NO `getActiveSheet()`, `getRange()`, or direct SpreadsheetApp calls on the agent's own sheet
   - This breaks when viewers have different sheets selected

2. **Use named properties for all agent configuration**
   - Define properties with SELECT + NAME commands
   - Access via `agent.ReadValue()`, `agent.WriteValue()`, `agent.ReadCheckbox()`, `agent.WriteCheckbox()`

3. **Store data in separate sheets**
   - Create data sheets using `SpreadsheetApp.create()`
   - Store the data sheet URL in a named property
   - Access data sheets using `agent.OpenSheetUsingUrlFromValue()`

4. **Use GAS utilities for data manipulation**
   - `GAS.MakeObjectsUsingSheetP()` to read data as objects
   - `GAS.WriteSheetUsingObjects()` to write data
   - `GAS.AddRowsToJournalingSheet()` for append operations

## Core Commands (alphabetical)

- **ABORT_UNLESS_ACTIVATED**
  Aborts execution unless agent is activated (EN checked or GO/WAKE triggered).

- **ABORT_UNLESS_INTERACTIVE**
  Aborts if not running interactively (e.g., via button).

- **ALIAS** `"name"`
  Sets an alias for the current agent connection (used with EXPORT/LOAD).

- **BG** `"#rrggbb"`
  Sets background color of selected range.

- **CHECKBOX** `"TRUE"|"FALSE"` [+ `"READONLY"`]
  Inserts checkboxes; optional READONLY prevents user changes.

- **CLEAR**
  Clears contents of selected range.

- **CLS**
  Clears the agent's output/log area.

- **CODE** `"---"` … `---`
  Stores multi-line code in the note of selected range. Automatically wraps code with TURN_ON, EVAL, and TURN_OFF boilerplate.

- **CONNECT** `"alias"`
  Connects to another agent by alias.

- **DEBUG**
  Toggles debugging mode.

- **ENTER_WHAT_IF_MODE_UNLESS** `"EN"`
  Enters dry-run mode unless named checkbox (e.g., EN) is checked. Sets `agent.WhatIf = true` when in dry-run mode.

- **ERROR** `"message"`
  Logs error message.

- **EVAL** `"---"` … `---`
  Executes raw JavaScript code (no de-indent).

- **< EVAL** `"---"` … `---`
  Executes JavaScript; leading `<` enables automatic de-indentation of inner lines.

- **EVALUE** `"expression"`
  Evaluates expression and sets result as value in selected range.

- **EXPORT**
  Exports current agent's named properties to shared object for LOAD.

- **FG** `"#rrggbb"`
  Sets font color of selected range.

- **FONT** `"family"`
  Sets font family of selected range.

- **FORMAT** `"DATETIME"|"CHECKBOX"|custom`
  Sets number/format of selected range.

- **FORMULA** `"=formula"`
  Sets spreadsheet formula in selected range.

- **HALIGN** `"left"|"center"|"right"`
  Sets horizontal alignment.

- **INFO** `"message"`
  Logs informational message (visible in INFO pane).

- **INSTALL** `url`
  Downloads and inserts routine from URL into instruction stream. By installing a script from a GitHub URL, it can be reinstalled to update when the contents of that URL change.

- **LOAD** `"PROP"`, `"SOURCE_AGENT"`
  Loads value of named property from another agent's exported data.

  **Special values (no source agent required):**
  - `$AGENT_ID` - Current agent's ID
  - `$LAST_INSTALL_URL` - URL of the last installed routine
  - `$NOW` - Current date/time

- **NAME** `"PROP_NAME"`
  Registers selected range as named property.

- **NEW_AGENT** `"sheet_name"`
  Creates new sheet and connects as new agent.

- **NOTE** `"---"` … `---`
  Sets cell note (multiline supported). Stores exact text as-is.

- **PUSH** `"value"`
  Pushes value onto stack.

- **REM** `"text"`
  Displays remark (interactive info).

- **RESERVE** `n`
  Reserves n rows for header/log area and applies default styling.

- **SELECT** `"A1"|"range"|"$PROP"|"STACK"`
  Selects range by A1 notation, named property value, or stack top.

- **STYLE** `"BUTTON"|"FIELD"|"READONLY_FIELD"`
  Applies predefined visual style.

- **TITLE** `"Agent Name"`
  Sets sheet title (appears as "fairy [title]").

- **TOAST** `"message"`
  Shows spreadsheet toast notification.

- **TURN_OFF**
  Disables agent after run.

- **TURN_ON**
  Enables agent for current run.

- **UNINSTALL**
  Uninstalls/removes the agent.

- **VALIDATE**
  Sets data validation (currently supports IS_GMAIL_LABEL or IS_URL types).

- **VALUE** `"text"`
  Sets raw value in selected range.

- **VALIGN** `"top"|"middle"|"bottom"`
  Sets vertical alignment.

- **WARN** `"message"`
  Logs warning message.

## Agent Object API Reference

Within EVAL blocks, the `agent` variable provides access to the AgentConnection instance:

### Properties
- **`agent.WhatIf`** (boolean) - True when agent is in dry-run mode (set via ENTER_WHAT_IF_MODE_UNLESS)

### Output Methods
- **`agent.Info(message, ...)`** - Logs informational messages (white text on black background)
- **`agent.Log(message, ...)`** - Logs debug messages (gray text on black background)
- **`agent.Warn(message, ...)`** - Logs warnings with ⚠️ badge (yellow text)
- **`agent.Error(message, ...)`** - Logs errors with ❌ badge (red text)
- **`agent.InteractiveInfo(...)`** - Like Info, but only outputs when running interactively
- **`agent.InteractiveLog(...)`** - Like Log, but only outputs when running interactively
- **`agent.InteractiveWarn(...)`** - Like Warn, but only outputs when running interactively
- **`agent.InteractiveError(...)`** - Like Error, but only outputs when running interactively

### Property Access Methods
- **`agent.ReadValue(name)`** - Reads value from named property
- **`agent.WriteValue(name, value)`** - Writes value to named property
- **`agent.ReadCheckbox(name)`** - Reads checkbox state (returns boolean)
- **`agent.WriteCheckbox(name, boolean)`** - Sets checkbox state
- **`agent.ReadNote(name)`** - Reads note text from named property
- **`agent.WriteNote(name, text)`** - Writes note text to named property

### Sheet Helper Methods
- **`agent.OpenSheetUsingUrlFromValue(propertyName)`** - Opens a sheet using URL stored in a named property
- **`agent.ProcessEachNewObjectFromSheet(sheet, callback)`** - Processes new rows from a journaling sheet
- **`agent.ExecuteRoutineUsingNoteName(noteName)`** - Executes a routine stored in a note
- **`agent.ClearOutput()`** - Clears the agent's output log area

### Scheduling Methods
- **`agent.Snooze(milliseconds)`** - Schedules next wake time (minimum 15000ms)
- **`agent.SnoozeUntilDate(date)`** - Schedules wake at specific date
- **`agent.SnoozeForever()`** - Disables automatic wake (must be manually triggered)

### Metadata Methods
- **`agent.GetName()`** - Returns sheet name
- **`agent.GetAgentId()`** - Returns agent ID (format: A{sheetId})

### Code Execution
- **`agent.EvalCode(code, sourceLabel)`** - Evaluates JavaScript code dynamically

## Available Utility Libraries

Beyond the standard Google Apps Script APIs (GmailApp, CalendarApp, SpreadsheetApp, etc.), Platycore provides:

### Lang Utilities
Utility functions for type conversion and data manipulation:

- **`Lang.MakeStringUsingAnyP(value)`** - Converts any value to string
- **`Lang.MakeIntUsingAnyP(value)`** - Converts any value to integer
- **`Lang.MakeBoolUsingAnyP(value)`** - Converts any value to boolean
- **`Lang.IsStringP(value)`** - Type checking for string
- **`Lang.IsNumberP(value)`** - Type checking for number
- **`Lang.IsObjectP(value)`** - Type checking for object
- **`Lang.IsArrayP(value)`** - Type checking for array
- **`Lang.IsMeaningfulP(value)`** - Checks if value is not empty/null/undefined
- **`Lang.GetTimestampNowP()`** - Current timestamp in milliseconds
- **`Lang.GetMidnightTimestampNowP()`** - Midnight timestamp for today
- **`Lang.MakeDateByDaysInFutureP(days)`** - Creates future date
- **`Lang.MakeMultimapUsingObjectsP(array, key)`** - Groups array by key
- **`Lang.MakeSetUsingObjectsP(array)`** - Creates set from array
- **`Lang.IsContainedInSetP(value, set)`** - Set membership check
- **`Lang.GetClockFromDateP(date)`** - Formats time string
- **`Lang.ClampStringLengthP(str, maxLength)`** - Truncates string

### GAS Utilities
Google Apps Script helper functions:

- **`GAS.MakeObjectsUsingSheetP(sheet)`** - Converts sheet to array of objects
- **`GAS.MakeTableUsingSheetP(sheet)`** - Converts sheet to table structure
- **`GAS.WriteSheetUsingObjects(sheet, objects, headers)`** - Writes objects to sheet
- **`GAS.AddRowsToJournalingSheet(rows, sheet)`** - Adds rows to top of sheet
- **`GAS.MergeSheetHeaders(sheet, headers)`** - Ensures headers exist
- **`GAS.OpenSheetUsingUrl(url)`** - Opens sheet from URL
- **`GAS.GetUrlFromSheet(sheet)`** - Gets URL for a sheet
- **`GAS.GetUrlFromGmailMessage(message)`** - Gets URL for Gmail message
- **`GAS.TrimSheetRows(sheet)`** - Removes excess empty rows
- **`GAS.LimitAndTrimSheetRows(sheet, maxRows)`** - Limits sheet to max rows

## Standard Control Section (recommended template)

```
--- EN ---
   SELECT  "C2"
     NAME  "EN"
 CHECKBOX  "FALSE"
   SELECT  "D2"
    VALUE  "EN"

--- ON ---
   SELECT  "C3"
     NAME  "ON"
 CHECKBOX  "TRUE"
        +  "READONLY"
   SELECT  "D3"
    VALUE  "ON"

--- GO ---
   SELECT  "C4"
     NAME  "GO"
 CHECKBOX  "FALSE"
   SELECT  "D4"
    VALUE  "GO"

--- WAKE ---
   SELECT  "H2:L2"
     NAME  "WAKE"
    STYLE  "READONLY_FIELD"
   EVALUE  "Lang.GetTimestampNowP() + 15000"
     LOAD  "WAKE", "OLD_AGENT"
   SELECT  "F2:G2"
    VALUE  "WAKE"
   SELECT  "F3:L3"
  FORMULA  "=(H2-(60*2+4)*1000)/1000/60/60/24+25568.6681"
   FORMAT  "DATETIME"

--- LOCK ---
   SELECT  "H5:L5"
     NAME  "LOCK"
    STYLE  "READONLY_FIELD"
   EVALUE  "Lang.GetTimestampNowP()"
   SELECT  "F5:G5"
    VALUE  "LOCK"
   SELECT  "F6:L6"
  FORMULA  "=(H5-(60*2+4)*1000)/1000/60/60/24+25568.6681"
   FORMAT  "DATETIME"
```

## EVAL Code Indentation

**Standard EVAL** (no de-indentation):
```
     NOTE  "---"
------------------------
   EVAL  "---"
------------------------
var x = 1;  // Code must start at column 1
agent.Info(x);
------------------------
```

**De-indented EVAL** (recommended):
```
     NOTE  "---"
------------------------
   <         EVAL "---"
   ------------------------
   var x = 1;  // Code indented to match the < line
   agent.Info(x);
   ------------------------
------------------------
```

The `<` tells the parser to measure indentation from the `<` line and remove that much leading whitespace from all following lines. This allows code to be visually aligned with the agent script structure.

## Button Structure Patterns

### Simple Button
```
--- [Button Name] ---
   SELECT "O5:S5"           # Position the button
    VALUE "[Button Name]"   # Button label
    STYLE "BUTTON"          # Yellow button styling
     NOTE "---"             # Start of executable routine
------------------------
   <         EVAL "---"     # De-indented code block
   ------------------------
   // Your JavaScript code here
   var data = doSomething();
   agent.Info("Result: " + data);
   ------------------------
------------------------
    TURN_OFF               # Disable agent when done
```

### Button with WhatIf Protection
```
--- [Delete Items] ---
   SELECT "N3:R3"
    VALUE "[Delete Items]"
    STYLE "BUTTON"
     NOTE "---"
------------------------
      ENTER_WHAT_IF_MODE_UNLESS "EN"  # Dry-run unless EN is checked
      EVAL "---"
   ------------------------
   if (agent.WhatIf) {
      agent.Info("[WhatIf]: Would delete items");
   } else {
      deleteItems();
      agent.Info("Deleted items");
   }
   ------------------------
      TURN_OFF
------------------------
```

### CODE vs NOTE Commands

**NOTE** - Direct multiline text with full control:
```
   SELECT "O5:S5"
     NOTE "---"
------------------------
      TURN_ON
      EVAL "---"
   ------------------------
   // Your code here
   ------------------------
      TURN_OFF
------------------------
```

**CODE** - Automatically wraps code with boilerplate:
```
   SELECT "O5:S5"
    VALUE "[Run]"
    STYLE "BUTTON"
     CODE "---"
------------------------
// Your code here (TURN_ON/EVAL/TURN_OFF added automatically)
agent.Info("Hello");
------------------------
```

**Recommendation:** Use NOTE for explicit control, CODE for simple interactive buttons.

## WhatIf Mode (Dry-Run Protection)

WhatIf mode allows agents to show what they *would* do without actually doing it. This is crucial for destructive operations.

**Setting WhatIf Mode:**
```
ENTER_WHAT_IF_MODE_UNLESS "EN"
```
This sets `agent.WhatIf = true` unless the EN checkbox is checked.

**Using WhatIf in EVAL blocks:**
```
   <         EVAL "---"
   ------------------------
   if (agent.WhatIf) {
      agent.Info("[WhatIf]: Would delete " + count + " items");
   } else {
      // Actually perform the deletion
      deleteItems();
      agent.Info("Deleted " + count + " items");
   }
   ------------------------
```

**Best Practices:**
- Always use WhatIf for destructive operations (delete, modify, send emails)
- Display clear "[WhatIf]:" prefixed messages showing what would happen
- Inform users how to enable real execution (e.g., "Set EN=TRUE to actually delete")
- Check `agent.WhatIf` before state changes (`agent.WriteValue`, etc.)

## Interactive vs Background Execution

Agents can run in two modes:

**Interactive Mode:**
- Triggered by clicking a button directly
- User can see immediate output
- `Platycore.IsInteractive` is true

**Background Mode:**
- Triggered by WAKE timer or GO checkbox
- Runs automatically via pump/scheduler
- `Platycore.IsInteractive` is false

**Using Interactive logging:**
```
agent.InteractiveLog("Debug info");  // Only shown when clicking button
agent.Log("Always shown");           // Shown in both modes
```

Use Interactive variants to reduce noise in background execution logs.

## Execution Flow
Typical agent flow:
1. ABORT_UNLESS_ACTIVATED (optional)
2. TURN_ON
3. ENTER_WHAT_IF_MODE_UNLESS "EN" (for operations that modify state)
4. Agent-specific logic
5. TURN_OFF

## Platycore Architecture Pattern

**IMPORTANT:** Platycore agents follow a specific architecture to ensure reliability:

### Agent Sheet vs Data Sheet

1. **Agent Sheet** (the sheet with the agent controls)
   - Contains configuration: EN, ON, GO, WAKE, LOCK checkboxes
   - Contains named properties for settings (URLs, counters, etc.)
   - Access ONLY via named properties using `agent.ReadValue/WriteValue` and `agent.ReadCheckbox/WriteCheckbox`
   - **NEVER use direct sheet access** (`getActiveSheet()`, `getRange()`, etc.) on the agent sheet

2. **Data Sheet** (separate sheet for data)
   - Store the data sheet URL in a named property on the agent sheet
   - Access using `agent.OpenSheetUsingUrlFromValue('PROPERTY_NAME')`
   - Manipulate using GAS utilities (`GAS.MakeObjectsUsingSheetP`, `GAS.WriteSheetUsingObjects`, etc.)

### Proper Pattern Example

**Setup (create data sheet and store URL):**
```
--- [Make Sheet] ---
   SELECT "AJ2:AN2"
    VALUE "[Make Sheet]"
    STYLE "BUTTON"
     CODE "---"
------------------------
var sheet = SpreadsheetApp.create("My Data", 1, 1).getSheets()[0];
var headers = GAS.MergeSheetHeaders(sheet, ['name', 'value']);
agent.WriteValue('DATA_SHEET', GAS.GetUrlFromSheet(sheet));
agent.Info('Created data sheet');
------------------------
```

**Read data from data sheet:**
```
var sheet = agent.OpenSheetUsingUrlFromValue('DATA_SHEET');
var objects = GAS.MakeObjectsUsingSheetP(sheet);
objects.forEach(function(obj) {
   agent.Info(obj.name + ": " + obj.value);
});
```

**Write data to data sheet:**
```
var sheet = agent.OpenSheetUsingUrlFromValue('DATA_SHEET');
var data = [{name: "Alice", value: 42}, {name: "Bob", value: 99}];
var headers = ['name', 'value'];
GAS.WriteSheetUsingObjects(sheet, data, headers);
```

**Read/write agent configuration:**
```
// Read from named properties
var count = agent.ReadValue('PROCESSED_COUNT');
var isEnabled = agent.ReadCheckbox('EN');

// Write to named properties
agent.WriteValue('PROCESSED_COUNT', count + 1);
agent.WriteCheckbox('GO', false);
```

## Working with Data Sheets

**Creating a data sheet:**
```
var sheet = SpreadsheetApp.create("My Data Sheet", 1, 1).getSheets()[0];
var headers = GAS.MergeSheetHeaders(sheet, ['column1', 'column2']);
agent.WriteValue('MY_DATA_SHEET', GAS.GetUrlFromSheet(sheet));
```

**Reading data from data sheet:**
```
var sheet = agent.OpenSheetUsingUrlFromValue('MY_DATA_SHEET');
var objects = GAS.MakeObjectsUsingSheetP(sheet);

// objects is now array like:
// [{column1: "value1", column2: "value2"}, ...]

objects.forEach(function(row) {
   agent.Info(row.column1 + ": " + row.column2);
});
```

**Writing objects to data sheet:**
```
var sheet = agent.OpenSheetUsingUrlFromValue('MY_DATA_SHEET');
var data = [
   {name: "Alice", age: 30},
   {name: "Bob", age: 25}
];

var headers = ["name", "age"];
GAS.WriteSheetUsingObjects(sheet, data, headers);
```

**Adding rows to journaling sheet (newest first):**
```
var sheet = agent.OpenSheetUsingUrlFromValue('MY_DATA_SHEET');
var rows = [["value1", "value2"], ["value3", "value4"]];
GAS.AddRowsToJournalingSheet(rows, sheet);
```

**REMEMBER:** Always access data sheets via `agent.OpenSheetUsingUrlFromValue()`, never via `getActiveSheet()`.

## Error Handling in EVAL Blocks

**Try-catch pattern:**
```
   <         EVAL "---"
   ------------------------
   try {
      var label = GmailApp.getUserLabelByName(labelName);
      if (label) {
         label.deleteLabel();
         agent.Info("Deleted: " + labelName);
      } else {
         agent.Warn("Label not found: " + labelName);
      }
   } catch (e) {
      agent.Error("Failed to delete '" + labelName + "': " + e.message);
   }
   ------------------------
```

**Validation before operations:**
```
   <         EVAL "---"
   ------------------------
   var dataSheetUrl = agent.ReadValue('DATA_SHEET');
   if (!Lang.IsMeaningfulP(dataSheetUrl)) {
      agent.Error('No data sheet configured. Click [Make Sheet] first.');
      return;  // Early exit from EVAL block
   }

   var sheet = agent.OpenSheetUsingUrlFromValue('DATA_SHEET');
   var objects = GAS.MakeObjectsUsingSheetP(sheet);

   if (objects.length === 0) {
      agent.Info("No data found. Please sync first.");
      return;
   }

   // Proceed with operations...
   ------------------------
```

## Reinstalling Agents (Updating While Preserving Data)

The reinstall pattern allows you to update an agent's code while preserving its configuration and state.

**Complete Reinstall Pattern:**
```
--- [Reinstall] ---
   SELECT "AS6:AV6"
    VALUE "[Reinstall]"
    STYLE "BUTTON"
     NOTE "---"
------------------------
      ALIAS "OLD_AGENT"           # Name this agent connection
      EXPORT                      # Export all named properties
      UNINSTALL                   # Delete this agent
      NEW_AGENT "NEW_AGENT"       # Create new blank agent
      SELECT "STACK"              # Use stack for next argument
      LOAD "REINSTALL_URL", "OLD_AGENT"  # Get URL from old agent
      INSTALL null                # Install from URL (null = pop from stack)
------------------------

   SELECT "AJ6:AR6"
     NAME "REINSTALL_URL"
    STYLE "FIELD"
     LOAD "$LAST_INSTALL_URL"    # Auto-populated with install URL
```

**How it works:**
1. Current agent exports all named properties to "OLD_AGENT" alias
2. Agent uninstalls itself (deletes the sheet)
3. A new blank agent sheet is created
4. The new agent loads the REINSTALL_URL from the old agent's exports
5. The new agent installs the script from that URL
6. During installation, `LOAD "PROPERTY", "OLD_AGENT"` commands restore saved values

**Installing from GitHub:**
If you host your agent script on GitHub, you can install and update it:
```
# Initial install (paste this into A1 of a new sheet)
   INSTALL "https://raw.githubusercontent.com/user/repo/main/agent.txt"
```

After initial install, the [Reinstall] button will pull the latest version from GitHub.

## Example Minimal Agent (List Gmail Labels)

```
      TITLE  "List Gmail Labels"
    RESERVE  7

--- EN ---
   SELECT  "C2"
     NAME  "EN"
 CHECKBOX  "FALSE"
   SELECT  "D2"
    VALUE  "EN"

--- ON ---
   SELECT  "C3"
     NAME  "ON"
 CHECKBOX  "TRUE"
        +  "READONLY"
   SELECT  "D3"
    VALUE  "ON"

--- GO ---
   SELECT  "C4"
     NAME  "GO"
 CHECKBOX  "FALSE"
   SELECT  "D4"
    VALUE  "GO"

--- WAKE ---
   SELECT  "H2:L2"
     NAME  "WAKE"
    STYLE  "READONLY_FIELD"
   EVALUE  "Lang.GetTimestampNowP() + 15000"
     LOAD  "WAKE", "OLD_AGENT"
   SELECT  "F2:G2"
    VALUE  "WAKE"
   SELECT  "F3:L3"
  FORMULA  "=(H2-(60*2+4)*1000)/1000/60/60/24+25568.6681"
   FORMAT  "DATETIME"

--- LOCK ---
   SELECT  "H5:L5"
     NAME  "LOCK"
    STYLE  "READONLY_FIELD"
   EVALUE  "Lang.GetTimestampNowP()"
   SELECT  "F5:G5"
    VALUE  "LOCK"
   SELECT  "F6:L6"
  FORMULA  "=(H5-(60*2+4)*1000)/1000/60/60/24+25568.6681"
   FORMAT  "DATETIME"

==================================================================
Agent-specific

--- [Run] ---
   SELECT  "O5:S5"
    VALUE  "[Run]"
    STYLE  "BUTTON"
     NOTE  "---"
------------------------
   <         EVAL "---"
   ------------------------
   var labels = GmailApp.getUserLabels();

   agent.Info("=== Gmail Labels (" + labels.length + " total) ===");

   if (labels.length === 0) {
     agent.Info("No labels found.");
   } else {
     labels.forEach(function(label) {
       var name = label.getName();
       var unread = label.getUnreadCount();
       var totalThreads = label.getThreads().length;

       agent.Info(name +
                   "  |  Unread: " + unread +
                   "  |  Total threads: " + totalThreads);
     });
   }

   agent.Info("=== End of label list ===");
   ------------------------
------------------------

    TURN_OFF
```

## Creation Steps
1. Open Platycore spreadsheet.
2. Insert new sheet for the agent.
3. Paste installer script starting in A1.
4. Platycore parses and builds UI/controls automatically.
5. Configure any fields/buttons.
6. Run via button or pump.

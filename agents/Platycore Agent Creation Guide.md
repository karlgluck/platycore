# Platycore Agent Creation Guide

## Overview
Platycore agents are defined in plain-text installer scripts using indented declarative commands. Lines without leading whitespace are comments. All executable commands must start with at least one space. Indentation level determines nesting and scope.

Multiline code blocks use `"< EVAL "---"` (or similar) where `<` triggers de-indentation: the parser trims the exact leading whitespace count from the `<` line on all subsequent lines until the closing `---`.

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
  Clears the agent’s output/log area.

- **CODE** `"---"` … `---`  
  Stores multi-line code in the note of selected range.

- **CONNECT** `"alias"`  
  Connects to another agent by alias.

- **DEBUG**  
  Toggles debugging mode.

- **ENTER_WHAT_IF_MODE_UNLESS** `"EN"`  
  Enters dry-run mode unless named checkbox (e.g., EN) is checked.

- **ERROR** `"message"`  
  Logs error message.

- **EVAL** `"---"` … `---`  
  Executes raw JavaScript code (no de-indent).

- **< EVAL** `"---"` … `---`  
  Executes JavaScript; leading `<` enables automatic de-indentation of inner lines.

- **EVALUE** `"expression"`  
  Evaluates expression and sets result as value in selected range.

- **EXPORT**  
  Exports current agent’s named properties to shared object for LOAD.

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
  Downloads and inserts routine from URL into instruction stream.

- **LOAD** `"PROP"`, `"SOURCE_AGENT"`  
  Loads value of named property from another agent’s exported data.

- **NAME** `"PROP_NAME"`  
  Registers selected range as named property.

- **NEW_AGENT** `"sheet_name"`  
  Creates new sheet and connects as new agent.

- **NOTE** `"---"` … `---`  
  Sets cell note (multiline supported).

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

## Button Trigger Example

```
--- [Run] ---
   SELECT  "O5:S5"
    VALUE  "[Run]"
    STYLE  "BUTTON"
     NOTE  "---"
------------------------
   <         EVAL "---"
   ------------------------
      // JavaScript code here, indented one level deeper than the < line
   ------------------------
------------------------
    TURN_OFF
```

## Execution Flow
Typical agent flow:
1. ABORT_UNLESS_ACTIVATED (optional)
2. TURN_ON
3. ENTER_WHAT_IF_MODE_UNLESS "EN"
4. Agent-specific logic
5. TURN_OFF

## Persistence Across Reinstalls
Use EXPORT + LOAD with ALIAS "OLD_AGENT" to retain config values when reinstalling.

## Output Methods
- `agent.Info()` → visible in INFO pane (preferred for structured output)
- `agent.Log()` → general log
- `agent.Warn()`, `agent.Error()`

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

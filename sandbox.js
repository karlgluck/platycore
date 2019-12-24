
/*



so from here, we move into expanding the "language" of the agent build script:
- add the ability to add input boxes
- create the output connection sheet specification and style
      (round-robin, broadcast, replace table, append row (incl retention policy), set value in key-value store, etc.)
- change notifications going "down the pipe" -- how do these get queued?

make sure that EVERYTHING cleans up after itself on its output:
- that way we can rely on the system scaling when it is running automatically "forever"
 with nobody looking at it
 - you are responsible for your "trash"
   --> I'm looking at YOU, agent.log! -- where does this get cleaned up?

   I think agent logs get trimmed by another guess-scheduled longer-running job 


*/


function getTriggerCount (val)
   {
   return ScriptApp.getProjectTriggers().length;
   }

// var getPipeLaunchFormula = function (toggleFromName)
//    {
//    Object.keys(toggleFromName).map(function (kToggle)
//       {
//       var eToggle = toggleFromName[kToggle];
//       if (eToggle.c > 25)
//          {
//          throw 'unable to configure anything past column 25 because we need to convert column index to letters past Z';
//          }
//       return eToggle.v + ',$' + String.fromCharCode(65 + eToggle.c + 1) + '$' + eToggle.r;
//       })
//       .join(',');
//    return '=PIPE_LAUNCH($A$1,'
//    }

// function PIPE_LAUNCH(isEnabled)
//    {
//    for (var iArgument = 1, iPair = 0, nArgumentCount = arguments.length; iArgument < nArgumentCount; iArgument += 2, ++iPair)
//       {
//       if (arguments[iArgument] != arguments[iArgument+1])
//          {
//          ScriptApp.newTrigger('triggerPipeLaunch').timeBased().after(100).create();
//          var triggerCount = ScriptApp.getProjectTriggers().length;
//          return '(' + triggerCount + ' pending)';
//          }
//       }
//    if (isLaunched)
//       {
//       if (!isEnabled)
//          {
//          return '❌ set EN';
//          }
//       }
//    return 'LAUNCH';
//    }

// function triggerPipeLaunch()
//    {
//    GAS_deleteTriggerByName('triggerPipeLaunch');
//    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
//    var sheets = spreadsheet.getSheets();
//    for (var iSheet = 0, nSheetCount = sheets.length; iSheet < nSheetCount; ++iSheet)
//       {
//       var eSheet = sheets[iSheet];
//       var range = eSheet.getRange(1, 1, 1, 3);
//       var signature = range.getValues()[0];
//       var isEnabled = signature[0] === true;
//       var isPipe = signature[1] === 'EN';
//       var isStarting = signature[2] === true;
//       if (isEnabled && isPipe && isStarting)
//          {
//          range.setValues([[true, 'EN', false]]);
//          var agent = new Agent(eSheet);
//          agent.log('agent online');
//          return;
//          }
//       }
//    }

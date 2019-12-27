function menuNewAgentFromText()
   {
   var ui = SpreadsheetApp.getUi();
   var response = ui.prompt('Enter agent instructions:', ui.ButtonSet.OK_CANCEL);
   if (response.getSelectedButton() === ui.Button.OK)
      {
      console.log('encoding',response.getResponseText());
      newAgent('data:text/json;base64,' + Util_base64FromString(response.getResponseText()));
      }
   }

function onOpen()
   {
   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addItem("New Agent", "menuNewAgent")
         .addToUi();
   }

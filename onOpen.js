
function onOpen()
   {
   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addItem("New", "menuNew")
         .addSeparator()
         .addItem("")
         .addToUi();
   }

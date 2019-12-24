
function onOpen()
   {
   var ui = SpreadsheetApp.getUi();
   ui.createMenu("Platycore")
         .addSubMenu(ui.createMenu("New...").addItem("Agent", "menuNewAgent"))
         .addSeparator()
         .addItem("Uninstall", "menuUninstallAgent")
         .addToUi();
   }

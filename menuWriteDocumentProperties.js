function menuWriteDocumentProperties ()
   {
   var range = SpreadsheetApp.getActiveRange();
   var icColumn = range.getColumn();
   var irRow = range.getRow();
   var sheet = range.getSheet();
   var properties = PropertiesService.getDocumentProperties();
   properties.getKeys().forEach(function (eKey)
      {
      var value = properties.getProperty(eKey);
      sheet.getRange(irRow, icColumn, 1, 2).setValues([[eKey, value]]);
      ++irRow;
      });
   }
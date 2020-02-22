
function newAgentFromText(text)
   {
   Platycore.CreateAgent('data:application/x-gzip;base64,' + Lang.GetBase64GzipFromString(text), null);
   }

var Platycore = (function (ns) {


//------------------------------------------------------------------------------------------------------------------------------------
//
// Add default values to Platycore global parameters that
// can be edited in the Script properties tab of the
// Project properties window on the web.

var scriptProperties = PropertiesService.getScriptProperties();
var defaultValueFromSettingName = {
      'DocumentTryLockWaitTime': 15000,
      'Verbose': true
      };
Object.keys(defaultValueFromSettingName).forEach(function (eSettingName) {
   ns[eSettingName] = Lang.TestMeaningfulValue(scriptProperties.getProperty(eSettingName)) || defaultValueFromSettingName[eSettingName];
   });


return ns;

})(Platycore || {});
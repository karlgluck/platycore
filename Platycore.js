var Platycore = (function (ns) {

//------------------------------------------------------------------------------------------------------------------------------------
//
// Add default values to Platycore global parameters that
// can be edited in the Script properties tab of the
// Project properties window on the web.

var scriptProperties = PropertiesService.getScriptProperties();
var configFromSettingName = {
      'DocumentTryLockWaitTime': { cast: Lang.intCast, defaultValue: 15000 },
      'Verbose': { cast: Lang.boolCast, defaultValue: true },
      'BlockRuntimeLimit': { cast: Lang.intCast, defaultValue: 60000 },
      'PumpRuntimeLimit': { cast: Lang.intCast, defaultValue: 300000 }
      };
Object.keys(configFromSettingName).forEach(function (eSettingName) {
   var config = configFromSettingName[eSettingName];
   var value = scriptProperties.getProperty(eSettingName);
   if (!Lang.IsMeaningful(value))
      {
      value = Lang.stringCast(config.defaultValue);
      scriptProperties.setProperty(eSettingName, value);
      }
   ns[eSettingName] = config.cast(value);
   });

return ns;

})(Platycore || {});
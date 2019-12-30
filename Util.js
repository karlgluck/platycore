function Util_clampStringLengthP(text, length)
   {
   text = String(text);
   if (text.length > length)
      {
      return text.substring(0, length - 3) + '...';
      }
   return text;
   }

function Util_rainbowColorFromAnyP(v)
   {
   var colors = ['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#9900ff'];
   return colors[((v >>> 0) % colors.length)];
   }

function Util_stringFromBase64(stringToDecode)
   {
   return String.fromCharCode.apply(String, Utilities.base64DecodeWebSafe(stringToDecode)); // this looks faster than the next line, but we should measure it
   //return Utilities.newBlob(Utilities.base64DecodeWebSafe(stringToDecode), 'text/plain').getDataAsString();
   }

function Util_base64FromString(stringToEncode)
   {
   return Utilities.base64EncodeWebSafe(Utilities.newBlob(stringToEncode).getBytes());
   }

function Util_objectFromBase64(stringToDecode)
   {
   return JSON.parse(Util_stringFromBase64(stringToDecode));
   }

function Util_base64FromObject(objectToEncode)
   {
   return Util_base64FromString(JSON.stringify(objectToEncode));
   }

// https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript/20373925
function Util_isNumber(v)
   {
   return !isNaN(parseFloat(v)) && !isNaN(v - 0)
   }

function Util_isObject(v)
   {
   return 'object' === typeof v && null !== v;
   }

function Util_isArray(v)
   {
   return Array.isArray(v);
   }

// https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type
function Util_isFunction(v)
   {
   return v && {}.toString.call(v) === '[object Function]';
   }

// https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
function Util_isString(v)
   {
   return 'string' === typeof v || v instanceof String;
   }

function Util_isObjectPropertyTruthy(v, flagName)
   {
   return 'object' === typeof v  && null !== v && !!v[flagName];
   }

function Util_isObjectPropertyArray(v, flagName)
   {
   return 'object' === typeof v  && null !== v && Array.isArray(v[flagName]);
   }

function Util_utsNowGet()
   {
   return new Date().getTime();
   }

var Util_makeLazyConstantMethod = function (self, name, valueCallback)
   {
   self[name] = function ()
      {
      var rv = valueCallback();
      self[name] = (function (rvConstant) { return function () { return rvConstant }})(rv);
      return rv;
      }
   };

var Util_stackTraceGet = function (qLevelsUp)
   {
   try {
      undefined.hasOwnProperty(null)
      }
   catch (e)
      {
      return e.stack.split('\n').slice(qLevelsUp).map(function (s) { return s.trim() }).join('\n')
      }
   };

// http://community.facer.io/t/moon-phase-formula-updated/35691/5
function Util_moonPhaseFromDate (date)
   {
   var moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
   var utc = date.getTime();

   var phaseFraction = Util_fmodP(
         (utc/2551442844-0.228535)
               +0.00591997 * Math.sin(utc/5023359217+3.1705094)
               +0.017672776 * Math.sin(utc/378923968-1.5388144)
               -0.0038844429 * Math.sin(utc/437435791+2.0017235)
               -0.00041488 * Math.sin(utc/138539900-1.236334),
         1
         );

   return moonPhases[Util_loopingIndexFromPercentP(moonPhases.length, phaseFraction)];
   };

// https://gist.github.com/wteuber/6241786
function Util_fmodP(a, b)
   {
   return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
   }

function Util_loopingIndexFromPercentP(nCount, pPercent)
   {
   var rvIndex = Math.max(0, Math.floor(nCount * pPercent + 1 / nCount) % nCount);
   return Util_isNumber(rvIndex) && rvIndex < nCount ? rvIndex : undefined;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_ClampStringLengthP(text, length)
   {
   text = String(text);
   if (text.length > length)
      {
      return text.substring(0, length - 3) + '...';
      }
   return text;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetRainbowColorFromAnyP(v)
   {
   var colors = ['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#9900ff'];
   return colors[((v >>> 0) % colors.length)];
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetDarkRainbowColorFromAnyP(v)
   {
   var colors = ['#5b0f00', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'];
   return colors[((v >>> 0) % colors.length)];
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetStringFromBase64(stringToDecode)
   {
   //return String.fromCharCode.apply(String, Utilities.base64DecodeWebSafe(stringToDecode)); // this looks faster than the next line, but we should measure it
   return Utilities.newBlob(Utilities.base64DecodeWebSafe(stringToDecode), 'text/plain').getDataAsString();
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetBase64FromString(stringToEncode)
   {
   return Utilities.base64EncodeWebSafe(Utilities.newBlob(stringToEncode).getBytes());
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetObjectFromBase64(stringToDecode)
   {
   return JSON.parse(Util_GetStringFromBase64(stringToDecode));
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetBase64FromObject(objectToEncode)
   {
   return Util_GetBase64FromString(JSON.stringify(objectToEncode));
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_IsDate(v)
   {
   return v instanceof Date && !isNaN(v.getTime());
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript/20373925

function Util_IsNumber(v)
   {
   return !isNaN(parseFloat(v)) && !isNaN(v - 0)
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_stopwatchStringFromDuration(dtDuration)
   {
   return Util_stopwatchStringFromDurationInSeconds(dtDuration / 1000);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_stopwatchStringFromDurationInMillis(dtMilliseconds)
   {
   return Util_stopwatchStringFromDurationInSeconds(dtMilliseconds / 1000);
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss

function Util_stopwatchStringFromDurationInSeconds(dtSeconds)
   {
    var s = parseInt(dtSeconds, 10);
    if (s < 0)
      {
      var prefix = '-';
      s = -s;
      }
   else
      {
      var prefix = '+';
      }
    var hours   = Math.floor(s / 3600);
    var minutes = Math.floor((s - (hours * 3600)) / 60);
    var seconds = s - (hours * 3600) - (minutes * 60);

    if (hours === 0 && minutes === 0 && seconds === 0)
      {
      return "00:0" + (s / 1000.0).toFixed(3);
      }

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    if (hours > 0)
      {
      if (hours < 10) {hours   = "0"+hours;}
      return prefix+hours+':'+minutes+':'+seconds;
      }
   else
      {
      return prefix+minutes+':'+seconds;
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_Average(numbers)
   {
   return Array.isArray(numbers) ? numbers.reduce(function (prev, current) { return prev + current}, 0) / numbers.length : undefined;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_IsUndefined(v)
   {
   return 'undefined' === typeof v;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_IsObject(v)
   {
   return 'object' === typeof v && null !== v;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_IsArray(v)
   {
   return Array.isArray(v);
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type

function Util_IsFunction(v)
   {
   return v && {}.toString.call(v) === '[object Function]';
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript

function Util_IsString(v)
   {
   return 'string' === typeof v || v instanceof String;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_IsObjectPropertyTruthy(v, flagName)
   {
   return 'object' === typeof v  && null !== v && !!v[flagName];
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_IsArrayInObjectPropertyP(v, flagName)
   {
   return 'object' === typeof v  && null !== v && Array.isArray(v[flagName]);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetTimestampNow()
   {
   return new Date().getTime();
   }

//------------------------------------------------------------------------------------------------------------------------------------

var Util_makeLazyConstantMethod = function (self, name, valueCallback)
   {
   self[name] = function ()
      {
      var rv = valueCallback();
      self[name] = (function (rvConstant) { return function () { return rvConstant }})(rv);
      return rv;
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------

var Util_stackTraceGet = function (qLevelsUp)
   {
   try{
      undefined.hasOwnProperty(null)
      }
   catch (e)
      {
      return e.stack.split('\n').slice(qLevelsUp).map(function (s) { return s.trim() }).join('\n')
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------
// http://community.facer.io/t/moon-phase-formula-updated/35691/5

function Util_GetMoonPhaseFromDate (date)
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

//------------------------------------------------------------------------------------------------------------------------------------

function Util_StringFromTimestamp(utsTime)
   {
   var date = new Date(utsTime);
   if (date instanceof Date && !isNaN(date.getTime()))
      {
      return date.toUTCString() + ' (=' + String(utsTime) + ')';
      }
   else
      {
      return '<invalid date> (=' + String(utsTime) + ')';
      }
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_StringFromDate(date)
   {
   return Util_IsDate(date) ? date.toUTCString() + ' (=' + String(utsTime) + ')' : '<invalid date>';
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://gist.github.com/wteuber/6241786

function Util_fmodP(a, b)
   {
   return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_loopingIndexFromPercentP(nCount, pPercent)
   {
   var rvIndex = Math.max(0, Math.floor(nCount * pPercent + 1 / nCount) % nCount);
   return Number(rvIndex) < nCount ? rvIndex : undefined;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_ObjectsFromTableP = function (table)
   {
   if (table.length === 0)
      {
      return [];
      }
   var headers = table[0];
   var rvObjects = [];
   for (var iRow = 1, iRowCount = table.length; iRow < iRowCount; ++iRow)
      {
      var obj = {};
      for (var iHeader = 0, nHeaderCount = headers.length; iHeader < nHeaderCount; ++iHeader)
         {
         obj[headers[iHeader]] = table[iRow][iHeader];
         }
      rvObjects.push(obj);
      }
   return rvObjects;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_TableFromObjectsP = function (objects, headers)
   {
   var rvTable =
      [Util_IsArray(headers) ? headers : Object.keys(objects.length < 1 ? [] : objects[0])]
      .concat(objects.map(function (eObject)
         {
         return headers.map(function (eHeader) { return eObject[eHeader] });
         }))
      ;
   return rvTable;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_GetRowsFromTableP = function (table)
   {
   return table.slice(1);
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_KeyValuePairsFromDictionaryP = function (dictionary)
   {
   return Object.keys(dictionary).map(function (eKey) { return {key:eKey, value:dictionary[eKey]} });
   };

//------------------------------------------------------------------------------------------------------------------------------------
//
// objects: [{q: 1, t:'apple'}, {q: 4, t:'pear'}, {q: 1, t:'banana'}]
//     key: 'q'
//
//  ==> rv: {1: [{q: 1, t:'apple'}, {q: 1, t:'banana'}], 4: [{q: 2, t:'pear'}]}

Util_ObjectArrayFromKeyDictionaryFromObjectsP = function (objects, key) {
   if (objects.length === 0) return {};

   var retval = {};
   for (var iObject = 0, nObjectCount = objects.length; iObject < nObjectCount; ++iObject) {
      var eObject = objects[iObject];
      var kValue = eObject[key];
      if (retval.hasOwnProperty(kValue))
         {
         retval[kValue].push(eObject);
         }
      else
         {
         retval[kValue] = [eObject];
         }
   }

   return retval;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_DictionaryFromObjectsP = function (objects, key)
   {
   if (objects.length === 0) return {};

   var retval = {};
   for (var iObject = 0, nObjectCount = objects.length; iObject < nObjectCount; ++iObject)
      {
      var eObject = objects[iObject];
      retval[eObject[key]] = eObject;
      }

   return retval;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_DictionaryFromTableP = function (table, key)
   {
   if (table.length === 0) return {};
  
   var headers = table[0];
   var iKey = headers.indexOf(key);
   if (iKey === -1)
      {
      return {};
      }
   
   var retval = {};
   var nHeaderCount = headers.length;
   for (var iRow = 0, nRowCount = table.length; iRow < nRowCount; ++iRow)
      {
      var row = table[iRow];
      var obj = {};
      for (var iHeader = 0; iHeader < nHeaderCount; ++iHeader)
         {
         obj[headers[iHeader]] = row[iHeader];
         }
      retval[row[iKey]] = obj;
      }

   return retval;
   };

//------------------------------------------------------------------------------------------------------------------------------------

function Util_TransposeRowsP(rows) {
  return rows[0].map(function (x,i) { return rows.map(function (x) { return x[i]; }); });
}

//------------------------------------------------------------------------------------------------------------------------------------

Util_GetSetFromObjectsP = function (objects)
   {
   var rvSet = {};
   for (var iObject = 0, nObjectCount = objects.length; iObject < nObjectCount; ++iObject)
      {
      rvSet[objects[iObject]] = null;
      }
   return rvSet;
   }

//------------------------------------------------------------------------------------------------------------------------------------

Util_GetSetFromPropertyOfObjectsP = function (objects, key)
   {
   var rvSet = {};
   for (var iObject = 0, nObjectCount = objects.length; iObject < nObjectCount; ++iObject)
      {
      rvSet[objects[iObject][key]] = null;
      }
   return rvSet;
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetFixedLengthStringFromInteger (value, length)
   {
   return '0000000000'.substr(0, length-Math.floor(Math.log(Math.max(1,parseInt(value))) / Math.log(10)) - 1) + String(value);
   }

//------------------------------------------------------------------------------------------------------------------------------------

Util_IsValueContainedInSet = function (value, set)
   {
   return set.hasOwnProperty(value);
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_IsValueMissingFromSet = function (value, set)
   {
   return !set.hasOwnProperty(value);
   };

//------------------------------------------------------------------------------------------------------------------------------------
Util_intCast = function (any)
   {
   return parseInt(any) || 0;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_boolCast = function (any)
   {
   return !!any;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_floatCast = function (any)
   {
   return parseFloat(any) || 0.0;
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_stringCast = function (any)
   {
   return String(any);
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_arrayCast = function (any)
   {
   if (Util_IsArray(any))
      {
      return any;
      }
   else
      {
      return [];
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------

Util_dateCast = function (any)
   {
   var rvDate = new Date(any);
   if (!isNaN(rvDate.getTime()))
      {
      return rvDate;
      }
   return new Date(0);
   };

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetWallTimeFromTimestamp (utsTimestamp)
   {
   return new Date(utsTimestamp-new Date().getTimezoneOffset()*60000).toUTCString().slice(-12, -4);
   }

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetUrlsFromString (text)
   {
      var urls = [];
      var re = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
      while (null != (match = re.exec(text)))
         {
         urls.push(match[0]);
         text = text.split(match[0]).join('');
         }
      return urls;
   };

//------------------------------------------------------------------------------------------------------------------------------------

function Util_GetZeroPaddedStringFromPositiveIntegerP (value, qDigitCount)
   {
   value = parseInt(value) || 0;
   return '0000000000000000'.slice(value < 1 ? 1 : Math.ceil(Math.log(value) / Math.log(10)), qDigitCount) + String(value);
   };
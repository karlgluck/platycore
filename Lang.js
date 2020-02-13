var Lang = (function (ns) {

//------------------------------------------------------------------------------------------------------------------------------------

ns.ClampStringLengthP = function (text, length)
   {
   text = String(text);
   if (text.length > length)
      {
      return text.substring(0, length - 3) + '...';
      }
   return text;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetRainbowColorFromAnyP = function (v)
   {
   var colors = ['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#9900ff'];
   return colors[((v >>> 0) % colors.length)];
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetDarkRainbowColorFromAnyP = function (v)
   {
   var colors = ['#5b0f00', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'];
   return colors[((v >>> 0) % colors.length)];
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetStringFromBase64 = function (stringToDecode)
   {
   return Utilities.ungzip(Utilities.newBlob(Utilities.base64DecodeWebSafe(stringToDecode), 'application/x-gzip')).getDataAsString();
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetBase64FromString = function (stringToEncode)
   {
   return Utilities.base64EncodeWebSafe(Utilities.gzip(Utilities.newBlob(stringToEncode), 'text.zip').getBytes());
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetObjectFromBase64 = function (stringToDecode)
   {
   return JSON.parse(ns.GetStringFromBase64(stringToDecode));
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetBase64FromObject = function (objectToEncode)
   {
   return ns.GetBase64FromString(JSON.stringify(objectToEncode));
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsDate = function (v)
   {
   return v instanceof Date && !isNaN(v.getTime());
   };

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript/20373925

ns.IsNumber = function (v)
   {
   return !isNaN(parseFloat(v)) && !isNaN(v - 0)
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.stopwatchStringFromDuration = function (dtDuration)
   {
   return ns.stopwatchStringFromDurationInSeconds(dtDuration / 1000);
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.stopwatchStringFromDurationInMillis = function (dtMilliseconds)
   {
   return ns.stopwatchStringFromDurationInSeconds(dtMilliseconds / 1000);
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss

ns.stopwatchStringFromDurationInSeconds = function (dtSeconds)
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

ns.Average = function (numbers)
   {
   return Array.isArray(numbers) ? numbers.reduce(function (prev, current) { return prev + current}, 0) / numbers.length : undefined;
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsUndefined = function (v)
   {
   return 'undefined' === typeof v;
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsObject = function (v)
   {
   return 'object' === typeof v && null !== v;
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsArray = function (v)
   {
   return Array.isArray(v);
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type

ns.IsFunction = function (v)
   {
   return v && {}.toString.call(v) === '[object Function]';
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript

ns.IsString = function (v)
   {
   return 'string' === typeof v || v instanceof String;
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsObjectPropertyTruthy = function (v, flagName)
   {
   return 'object' === typeof v  && null !== v && !!v[flagName];
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsArrayInObjectPropertyP = function (v, flagName)
   {
   return 'object' === typeof v  && null !== v && Array.isArray(v[flagName]);
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetTimestampNow = function ()
   {
   return new Date().getTime();
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeLazyConstantMethod = function (self, name, valueCallback)
   {
   self[name] = function ()
      {
      var rv = valueCallback();
      self[name] = (function (rvConstant) { return function () { return rvConstant }})(rv);
      return rv;
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetStackTrace = function (qLevelsUp)
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

ns.GetMoonPhaseFromDate = function  (date)
   {
   var moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
   var utc = date.getTime();

   var phaseFraction = ns.fmodP(
         (utc/2551442844-0.228535)
               +0.00591997 * Math.sin(utc/5023359217+3.1705094)
               +0.017672776 * Math.sin(utc/378923968-1.5388144)
               -0.0038844429 * Math.sin(utc/437435791+2.0017235)
               -0.00041488 * Math.sin(utc/138539900-1.236334),
         1
         );

   return moonPhases[ns.GetLoopingIndexFromPercentP(moonPhases.length, phaseFraction)];
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetStringFromTimestamp = function (utsTime)
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

ns.GetStringFromDate = function (date)
   {
   return ns.IsDate(date) ? date.toUTCString() + ' (=' + String(utsTime) + ')' : '<invalid date>';
   }

//------------------------------------------------------------------------------------------------------------------------------------
// https://gist.github.com/wteuber/6241786

ns.fmodP = function (a, b)
   {
   return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetLoopingIndexFromPercentP = function (nCount, pPercent)
   {
   var rvIndex = Math.max(0, Math.floor(nCount * pPercent + 1 / nCount) % nCount);
   return Number(rvIndex) < nCount ? rvIndex : undefined;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetObjectsFromTableP = function (table)
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
   }

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetTableFromObjectsP = function (objects, headers)
   {
   var rvTable =
      [ns.IsArray(headers) ? headers : Object.keys(objects.length < 1 ? [] : objects[0])]
      .concat(objects.map(function (eObject)
         {
         return headers.map(function (eHeader) { return eObject[eHeader] });
         }))
      ;
   return rvTable;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetRowsFromTableP = function (table)
   {
   return table.slice(1);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetKeyValuePairsFromDictionaryP = function (dictionary)
   {
   return Object.keys(dictionary).map(function (eKey) { return {key:eKey, value:dictionary[eKey]} });
   };

//------------------------------------------------------------------------------------------------------------------------------------
//
// objects: [{q: 1, t:'apple'}, {q: 4, t:'pear'}, {q: 1, t:'banana'}]
//     key: 'q'
//
//  ==> rv: {1: [{q: 1, t:'apple'}, {q: 1, t:'banana'}], 4: [{q: 2, t:'pear'}]}

ns.GetObjectArrayFromKeyDictionaryFromObjectsP = function (objects, key) {
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

ns.GetDictionaryFromObjectsP = function (objects, key)
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

ns.GetDictionaryFromTableP = function (table, key)
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

ns.TransposeRowsP = function (rows)
   {
   return rows[0].map(function (x,i) { return rows.map(function (x) { return x[i]; }); });
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeSetFromObjectsP = function (objects)
   {
   var rvSet = {};
   for (var iObject = 0, nObjectCount = objects.length; iObject < nObjectCount; ++iObject)
      {
      rvSet[objects[iObject]] = null;
      }
   return rvSet;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetStringWithLeadingZeroesFromNumber = function  (value, length)
   {
   return '0000000000000000'.substr(0, length-Math.floor(Math.log(Math.max(1,parseInt(value))) / Math.log(10)) - 1) + String(value);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsValueContainedInSetP = function (value, set)
   {
   return set.hasOwnProperty(value);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsValueMissingFromSetP = function (value, set)
   {
   return !set.hasOwnProperty(value);
   };

//------------------------------------------------------------------------------------------------------------------------------------
ns.intCast = function (any)
   {
   return parseInt(any) || 0;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.boolCast = function (any)
   {
   return !!any;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.floatCast = function (any)
   {
   return parseFloat(any) || 0.0;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.stringCast = function (any)
   {
   return String(any);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.arrayCast = function (any)
   {
   if (ns.IsArray(any))
      {
      return any;
      }
   else
      {
      return [];
      }
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.dateCast = function (any)
   {
   var rvDate = new Date(any);
   if (!isNaN(rvDate.getTime()))
      {
      return rvDate;
      }
   return new Date(0);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetWallTimeFromTimestamp = function  (utsTimestamp)
   {
   return new Date(utsTimestamp-new Date().getTimezoneOffset()*60000).toUTCString().slice(-12, -4);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetUrlsFromString = function  (text)
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


return ns;
})(Lang || {});
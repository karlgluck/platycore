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

ns.GetStringFromBase64Gzip = function (stringToDecode)
   {
   return Utilities.ungzip(Utilities.newBlob(Utilities.base64DecodeWebSafe(stringToDecode), 'application/x-gzip')).getDataAsString();
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetBase64GzipFromString = function (stringToEncode)
   {
   return Utilities.base64EncodeWebSafe(Utilities.gzip(Utilities.newBlob(stringToEncode), 'text.zip').getBytes());
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
// "Meaningfulness" is the idea that the variable
// is not only valid, but also that it contains
// some sort of information.

ns.IsMeaningful = function (any)
   {
   return !ns.IsUndefined(any) && null !== any && (!ns.IsString(any) || any.trim().length > 0);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.TestMeaningfulValue = function (any)
   {
   return ns.IsMeaningful(any) ? any : undefined;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.Average = function (numbers)
   {
   return Array.isArray(numbers) ? numbers.reduce(function (prev, current) { return prev + current}, 0) / numbers.length : undefined;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsUndefined = function (v)
   {
   return 'undefined' === typeof v;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsNotUndefined = function (v)
   {
   return 'undefined' !== typeof v;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsObject = function (v)
   {
   return 'object' === typeof v && null !== v;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsArray = function (v)
   {
   return Array.isArray(v);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeArray = function (nLength, defaultValue)
   {
   return Array.apply(null, new Array(nLength)).fill(defaultValue);
   };

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type

ns.IsFunction = function (v)
   {
   return v && {}.toString.call(v) === '[object Function]';
   };

//------------------------------------------------------------------------------------------------------------------------------------
// https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript

ns.IsString = function (v)
   {
   return 'string' === typeof v || v instanceof String;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsObjectPropertyTruthy = function (v, propertyName)
   {
   return 'object' === typeof v  && null !== v && !!v[propertyName];
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.IsArrayInObjectPropertyP = function (v, propertyName)
   {
   return 'object' === typeof v  && null !== v && Array.isArray(v[propertyName]);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetTimestampNow = function ()
   {
   return new Date().getTime();
   };

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

ns.IsStringAffirmative = function (s)
   {
   var lowercaseString = String(s).trim().toLowerCase();
   return ['yes','ok','on','true'].some(function (e) { return lowercaseString === e });
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetClockFromDate = function (date)
   {
   var qShortHand = date.getHours() % 12
   var qMinutes = date.getMinutes();
   var qLongHand = (qMinutes - (qMinutes % 30)) / 30 ? 1 : 0;
   
   var clockEmojis = ['\uD83D\uDD5B', '\uD83D\uDD67', '\uD83D\uDD50', '\uD83D\uDD5C', '\uD83D\uDD51', '\uD83D\uDD5D', '\uD83D\uDD52', '\uD83D\uDD5E', '\uD83D\uDD53', '\uD83D\uDD5F', '\uD83D\uDD54', '\uD83D\uDD60', '\uD83D\uDD55', '\uD83D\uDD61', '\uD83D\uDD56', '\uD83D\uDD62', '\uD83D\uDD57', '\uD83D\uDD63', '\uD83D\uDD58', '\uD83D\uDD64', '\uD83D\uDD59', '\uD83D\uDD65', '\uD83D\uDD5A', '\uD83D\uDD66'];
   var iClockFace = qShortHand * 2 + qLongHand;
   return clockEmojis[iClockFace];
   };

//------------------------------------------------------------------------------------------------------------------------------------
// https://dmitripavlutin.com/what-every-javascript-developer-should-know-about-unicode/#21-characters-and-code-points
// GetUnicodeSurrogatePairFromAstralCodePoint(0x1F600); // => [0xD83D, 0xDE00]

ns.GetUnicodeSurrogatePairFromAstralCodePoint = function (astralCodePoint)
   {
   var highSurrogate = Math.floor((astralCodePoint - 0x10000) / 0x400) + 0xD800;
   var lowSurrogate = (astralCodePoint - 0x10000) % 0x400 + 0xDC00;
   return [highSurrogate, lowSurrogate];
   };

//------------------------------------------------------------------------------------------------------------------------------------
// GetUnicodeAstralCodePointFromSurrogatePair(0xD83D, 0xDE00); // => 0x1F600

ns.GetUnicodeAstralCodePointFromSurrogatePair = function (highSurrogate, lowSurrogate)
   {
   return (highSurrogate - 0xD800) * 0x400 + lowSurrogate - 0xDC00 + 0x10000;
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

ns.GetHeadersFromTableP = function (table)
   {
   return table[0];
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.GetRowsFromTableP = function (table)
   {
   return table.slice(1);
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeKeyValuePairsUsingDictionaryP = function (dictionary)
   {
   return Object.keys(dictionary).map(function (eKey) { return {key:eKey, value:dictionary[eKey]} });
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeRelationshipsUsingTable = function (table)
   {
   var headers = table[0];
   var iMainColumn, relationshipTargetNames, propertyNames, kRelationshipSource, kRelationshipTargets;
   for (var iHeader = 0, nHeaderCount = headers.length; iHeader < nHeaderCount; ++iHeader)
      {
      var eHeader = headers[iHeader];
      var split = eHeader.indexOf(' | ');
      if (split > 0)
         {
         iMainColumn = iHeader;
         propertyNames = headers.slice(0, iMainColumn);
         relationshipTargetNames = headers.slice(iMainColumn + 1);
         kRelationshipSource = eHeader.slice(0, split);
         kRelationshipTargets = eHeader.slice(split + 3);
         break;
         }
      }

   var rvRelationships = [];

   if (ns.IsString(kRelationshipSource) && ns.IsString(kRelationshipTargets))
      {
      for (var iRow = 1, nRows = table.length; iRow < nRows; ++iRow)
         {
         var row = table[iRow];
         var obj = {};
         propertyNames.forEach(function (e, i) { obj[e] = row[i] });
         obj[kRelationshipSource] = row[iMainColumn];
         obj[kRelationshipTargets] = relationshipTargetNames
                     .map(function (e, i) { return ns.boolCast(row[iMainColumn+1+i]) ? e : undefined })
                     .filter(ns.IsNotUndefined);
         rvRelationships.push(obj);
         }
      }

   return rvRelationships;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeObjectUsingKeyValuePairs = function (pairs)
   {
   var rvObject = {};
   pairs.forEach(function (eKeyValuePair) { rvObject[eKeyValuePair[0]] = eKeyValuePair[1] });
   return rvObject;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.MakeIndexFromContentDictionaryUsingArrayP = function (array)
   {
   var rvObject = {};
   array.forEach(function (e, i) { rvObject[e] = i; });
   return rvObject;
   };

//------------------------------------------------------------------------------------------------------------------------------------
//
// objects: [{q: 1, t:'apple'}, {q: 4, t:'pear'}, {q: 1, t:'banana'}]
//     key: 'q'
//
//  ==> rv: {1: [{q: 1, t:'apple'}, {q: 1, t:'banana'}], 4: [{q: 2, t:'pear'}]}

ns.GetObjectArrayFromKeyDictionaryFromObjectsP = function (objects, key)
   {
   if (objects.length === 0) return {};

   var retval = {};
   for (var iObject = 0, nObjectCount = objects.length; iObject < nObjectCount; ++iObject)
      {
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

//------------------------------------------------------------------------------------------------------------------------------------

ns.lcontains = function (list, searchItem)
   {
   return list.indexOf(searchItem) >= 0;
   };

//------------------------------------------------------------------------------------------------------------------------------------

ns.lcontains = function (list, searchItem)
   {
   return list.indexOf(searchItem) >= 0;
   };

//------------------------------------------------------------------------------------------------------------------------------------

// ns.intersect3 = function (list, searchItem)
//    {
//    return list.indexOf(searchItem) < 0;
//    };

return ns;
})(Lang || {});
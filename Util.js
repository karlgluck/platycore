function Util_clampStringLengthP(text, length)
   {
   text = String(text);
   if (text.length > length)
      {
      return text.substring(0, length - 3) + '...';
      }
   return text;
   }

function Util_rainbowColorFromValueP(v)
   {
   const colors = ['#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#9900ff'];
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
function Util_isNumber(n)
   {
   return !isNaN(parseFloat(n)) && !isNaN(n - 0)
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
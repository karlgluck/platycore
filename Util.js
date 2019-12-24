function Util_clampStringLengthP(text, length)
   {
   text = String(text);
   if (text.length > length)
      {
      return text.substring(0, length - 3) + '...';
      }
   return text;
   }
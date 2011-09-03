//why? http://ejohn.org/blog/html5-shiv/
//who? http://remysharp.com/2009/01/07/html5-enabling-script/
//where? http://code.google.com/p/html5shiv/
var e = ("abbr,article,aside,audio,canvas,datalist,details," +
  "figure,footer,header,hgroup,mark,menu,meter,nav,output," +
  "progress,section,time,video").split(',');
for (var i = 0; i < e.length; i++) {
  document.createElement(e[i]);
}

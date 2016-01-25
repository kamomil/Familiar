/*
$(document).ready(function(){


	var contexts = chrome.extension.getBackgroundPage().contexts;
	var canonWord =  chrome.extension.getBackgroundPage().canonWord;
	var def =  chrome.extension.getBackgroundPage().def; // an array
   
	if(contexts === ""){
		$("body").append("<h1>This is the first time you add this word</h1>");
	}
	else{
		var str = "";
		console.log("show_contexts_jquery: "+contexts.length);
		for(var i=0 ; i<contexts.length ; i++){
		    console.log("context "+i+": "+contexts[i]);	
			console.log("ctx="+contexts[i].ctx);
			console.log("origWord="+contexts[i].orig_word);
			var origWordRgx = new RegExp (contexts[i].orig_word,'g');
			contexts[i].ctx = contexts[i].ctx.replace(origWordRgx,"<span id=word>"+contexts[i].orig_word+"</span>");
			console.log("after replace: ctx= "+contexts[i].ctx);
			$("body").append("context "+i+":<br>"+contexts[i].ctx+"<br><br>");
		}
	}
    if(def !== undefined){
        $("body").append("<h1>DEFINITION:<\h1>");
        $("body").append(def.length);
        for(var i=0;i<Math.min(def.length,4);i++){
            $("body").append("x"+def[i]+"<br><br>");
        }
    }
});

jQuery(document).ready(function(){
var i = 0;
//for(i=0;i<100000000;i++);
console.log("10");
//document.getElementById("").innerHTML = "1"
$("body").append("<h1>1</h1>");
for(i=0;i<10000000000;i++);
console.log("2");
$("body").append("<h1>2</h1>");
//document.getElementById("demo").innerHTML = "2";
//$("body").append("1");
for(i=0;i<100000000;i++);
console.log("3");
$("body").append("<h1>3</h1>");
for(i=0;i<100000000;i++);
console.log("4");
$("body").append("<h1>4</h1>");
for(i=0;i<100000000;i++);
console.log("5");
$("body").append("<h1>5</h1>");

console.log("show_contexts_jquery: out message listener");
});
*/


console.log("show_contexts_jquery: out message listener 2");
chrome.runtime.sendMessage({popup_ready : "ready"},
   function(response) {
       
       console.log("show_contexts_jquery: in message listener "+response.canonWord);
       var contexts = response.contexts;
       var canonWord =  response.canonWord;
       var def =  response.def; // an array
       
       if(contexts === ""){
	   $("body").append("<h1>This is the first time you add this word</h1>");
       }
       else{
	   var str = "";
	   console.log("show_contexts_jquery: "+contexts.length);
	   for(var i=0 ; i<contexts.length ; i++){
	       console.log("context "+i+": "+contexts[i]);	
	       console.log("ctx="+contexts[i].ctx);
	       console.log("origWord="+contexts[i].orig_word);
	       var origWordRgx = new RegExp (contexts[i].orig_word,'g');
	       contexts[i].ctx = contexts[i].ctx.replace(origWordRgx,"<span id=word>"+contexts[i].orig_word+"</span>");
	       console.log("after replace: ctx= "+contexts[i].ctx);
	       $("body").append("context "+i+":<br>"+contexts[i].ctx+"<br><br>");
	   }
       }
       if(def !== undefined){
           $("body").append("<h1>DEFINITION:<\h1>");
           $("body").append(def.length);
           for(var i=0;i<Math.min(def.length,4);i++){
               $("body").append("x"+def[i]+"<br><br>");
           }
       }
  }
);




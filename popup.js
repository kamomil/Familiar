console.log("out message listener 2");

var background = chrome.extension.getBackgroundPage();
var canonWord = background.global_canon_word;
var contexts = background.global_contexts;
var global_def = background.global_def;

var def_added = false;

console.log("in message listener "+canonWord);

$(document).ready(function () {
$("body").append("<h1>Familiar</h1>");
$("body").append("<h2>Contexts and definition for '" + canonWord + "'</h2>");
$("body").append("<h3>Contexts</h3>");

if(contexts === ""){
    $("body").append("<p>This is the first time you've added this word</p>");
}
else{
    var str = "";
    console.log("contexts.length");
    var ol = $("<ol>").appendTo("body");
    for(var i=0 ; i<contexts.length ; i++){
        console.log("<span class='context'>context "+i+": </span>"+contexts[i]);
        console.log("ctx="+contexts[i].ctx);
        console.log("origWord="+contexts[i].orig_word);
        var origWordRgx = new RegExp (contexts[i].orig_word,'g');
        contexts[i].ctx = contexts[i].ctx.replace(origWordRgx,"<span id=word>"+contexts[i].orig_word+"</span>");
        console.log("after replace: ctx= "+contexts[i].ctx);
        $("<li>" + contexts[i].ctx+"</li>").appendTo(ol);
    }

}
});

if(global_def)
    add_def(def)

function add_def(def) {

    if(!def_added){
        $("body").append("<h3>Definition</h3>");

        var ul = $("<ul>").appendTo("body");
        for(var i=0;i<Math.min(def.length,20);i++){
            $("<li>"+def[i]/*.substr(1)*/+"</li>").appendTo(ul);
        }
        def_added = true;
    }
}

chrome.runtime.onMessage.addListener(function(def, sender,resp) {
    console.log("adding def from listener")
    add_def(def);
});





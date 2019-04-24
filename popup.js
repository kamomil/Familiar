var background = chrome.extension.getBackgroundPage();
var canonWord = background.global_canon_word;
var contexts = background.global_contexts;
var lastWordDate = background.global_last_word_date;

function mustache_render(jquey_id, view) {
  var tag = $(jquey_id);
  var rendered = Mustache.to_html(tag.html(), view);
  rendered = rendered.replace(new RegExp('href="/wiki', 'g'), 'target="_blank" href="https://en.wiktionary.org/wiki');
  console.log(rendered);
  $(tag).html(rendered);
}

$(document).ready(function () {

    mustache_render('#canon' , {canonWord : canonWord});

    html_ctx = {contexts : contexts_to_html(contexts)};
    mustache_render('#contexts' , html_ctx);
});

lang_codes = {
    "bg" : 	"Bulgarian",
    "cs" : 	"Czech",
    "da" : 	"Danish",
    "de" : 	"German",
    "el" : 	"Greek",
    "en" : 	"English",
    "es" : 	"Spanish",
    "et" : 	"Estonian",
    "fi" : 	"Finnish",
    "fr" : 	"French",
    "ga" : 	"Irish",
    "hr" : 	"Croatian",
    "hu" : 	"Hungarian",
    "it" : 	"Italian",
    "lt" : 	"Lithuanian",
    "lvv":	"Latvian",
    "mt" : 	"Maltese",
    "nl" : 	"Dutch",
    "pl" : 	"Polish",
    "pt" : 	"Portuguese",
    "ro" : 	"Romanian",
    "sk" : 	"Slovak",
    "sl" : 	"Slovenian",
    "sv" : 	"Swedish"
};

chrome.runtime.onMessage.addListener(function(def, sender,resp) {
   def.languages = [];
   for (var property in def) {
        if (def.hasOwnProperty(property) && property != "languages") {
            if(lang_codes[property])
                def.languages.unshift({lang:lang_codes[property],record:def[property]});
            else
                console.log("Lang: "+property+" Not supported yet");

        }
    }
    mustache_render('#def', def);
});





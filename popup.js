var background = chrome.extension.getBackgroundPage();
var canonWord = background.global_canon_word;
var contexts = background.global_contexts;

function mustache_render(jquey_id, view) {
  var tag = $(jquey_id);
  var rendered = Mustache.to_html(tag.html(), view);
  rendered = rendered.replace(new RegExp('href="/wiki', 'g'), 'href="https://en.wiktionary.org/wiki');
  console.log(rendered)
  $(tag).html(rendered);
}

$(document).ready(function () {

    mustache_render('#canon' , {canonWord : canonWord});

    html_ctx = {contexts : []}
    for(var i=0 ; i<contexts.length ; i++){
        var origWordRgx = new RegExp (contexts[i].orig_word,'g');
        ctx = contexts[i].ctx.replace(origWordRgx,'<span id="word">'+contexts[i].orig_word+'</span>');
        html_ctx.contexts.push(ctx)
    }
    mustache_render('#contexts' , html_ctx);
});


chrome.runtime.onMessage.addListener(function(def, sender,resp) {
    mustache_render('#def', def)
});





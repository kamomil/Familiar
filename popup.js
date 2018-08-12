var background = chrome.extension.getBackgroundPage();
var canonWord = background.global_canon_word;
var contexts = background.global_contexts;

function mustache_render(jquey_id, view) {
  var tag = $(jquey_id);
  var rendered = Mustache.to_html(tag.html(), view);
  rendered = rendered.replace(new RegExp('href="/wiki', 'g'), 'target="_blank" href="https://en.wiktionary.org/wiki');
  console.log(rendered)
  $(tag).html(rendered);
}

$(document).ready(function () {

    mustache_render('#canon' , {canonWord : canonWord});

    html_ctx = {contexts : contexts_to_html(contexts)}
    mustache_render('#contexts' , html_ctx);
});


chrome.runtime.onMessage.addListener(function(def, sender,resp) {
    mustache_render('#def', def)
});





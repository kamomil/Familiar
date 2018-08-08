var id = chrome.contextMenus.create({"title": "add to my voc", "contexts": ["selection"], "onclick": onClick});
console.log("item: " + id);


var tab_code = `
    var sel = window.getSelection();
    console.log(sel);
    var range = sel.getRangeAt(0);
    var to_parent = range.endContainer.isEqualNode(range.startContainer);
    var container = range.commonAncestorContainer;
    range.selectNode(container);
    if(to_parent){
        container = range.commonAncestorContainer;
        range.selectNodeContents(container);
    }
    console.log(range);
    range.toString();
`

function onClick(info, tab) {
    console.log("in generic click: ");
    console.log(info);
    console.log(tab);

    var wordRegex = /[a-zA-Z]+(\W*[a-zA-Z]+)?/;
    var word = wordRegex.exec(info.selectionText);
    word = word[0];
    console.log(word);
    if(word === null)
        return

    chrome.tabs.executeScript(tab.id, {code: tab_code},
     function(range) {

        ctx = naiveSentenceRec(range[0],word);
        if(ctx===""){
            alert("You miss selected the word");
        }
        else{
            var def = null;
            var canonWord = word.replace(/\W+/,"-").toLowerCase();
            var contexts = update_contexts(info.selectionText,canonWord,ctx)

            function process_def(data,text){
                def = 1
                var jdata = $(data);
                def = jdata.find('li').map(function() {
                    return $(this).text();
                }).get();
                def = 1;
                console.log("in process def")
                console.log(def)
            }
            $.get("https://en.wiktionary.org/wiki/"+canonWord, process_def ).fail(process_def);
        }
     });
}

function create_window(){
    console.log("about to create");
      chrome.windows.create({url: "show_contexts_jquery.html", type: "popup", width: 500, height: 600, left: 200, top: 20}, function(tab){
          /* this will be executed right after the create , before the html's js will run, so here we should add listener to the created html*/

          /* the listerner listen to the sendrequest from the show_contexts_jquery.js and will responde
             with the word and the context
          */
          chrome.runtime.onMessage.addListener(function listen(request, sender, sendResponse) {
          console.log("in popup listener "+sender.tab);
          console.log(request);
          if (request.popup_ready)
          {
              console.log("got popup ready "+ canonWord);
              sendResponse({"def" : def, "canonWord": canonWord, "contexts" : contexts});
              chrome.runtime.onMessage.removeListener(listen);/* need to remove previous listener so there will always be only one*/
          }
          });//end of listener

      });//end of windown.create callback
}

function update_contexts(origWord, canonWord, new_context){

      contexts = JSON.parse(localStorage.getItem(canonWord))
      console.log(localStorage.getItem(canonWord))

      /* word does not exist in the local storage: - add it*/
      if(contexts === null){
          console.log("background: first ctx for the word\n"+new_context);
          contexts = [{ctx:new_context,orig_word:origWord}];
      }
      /* word already exist - add the current context to the existing list of contexts for this word*/
      else{
          console.log("found new ctx");
          contexts.push({ctx:new_context,orig_word:origWord});
      }
      console.log("background: contexts=\n"+JSON.stringify(contexts));
      localStorage.setItem(canonWord,JSON.stringify(contexts));

      return contexts;
}

/*
given a paragraph and a word , return the senetence in the paragraph where the word appear.
This code is a bit messy
*/
function naiveSentenceRec(paragraph ,word){
    //current implementation:
    //split the paragraph according to commas.
    //in the list, if a variable is not a new line, concate it to the one before.

    var commaSplitList = paragraph.split(/\./g);
    var sntncList = [commaSplitList[0]];
    var sntncIdx =0;
    for(var i=1 ; i<commaSplitList.length ; i++){

        var notNew = /^(\W*\w*){0,2}\W*$/; //anything which is less than 2 words won't consider a new senetence.
        if(commaSplitList[i].match(notNew)){
            sntncList[sntncIdx] = sntncList[sntncIdx]+"."+commaSplitList[i];
        }
        else{
            sntncIdx++;
            sntncList[sntncIdx] = commaSplitList[i];
        }
    }
    //now we return the senetence of the word with the senetence before and after it.
    //word = word.replace(" ","\s");
    var ctxRegex = new RegExp("\\b"+word+"\\b");
    ctx = "";
    var LIMIT_CTX_LENGTH = 200;
    for(var i=0;i<sntncList.length;i++){

        if(ctxRegex.test(sntncList[i])){
            ctx = sntncList[i]+".";
            if(i>0 && ctx.length<LIMIT_CTX_LENGTH && sntncList[i-1].length<LIMIT_CTX_LENGTH)
                ctx = sntncList[i-1]+"."+ctx;
            if(i+1<sntncList.length && ctx.length<LIMIT_CTX_LENGTH && sntncList[i+1]<LIMIT_CTX_LENGTH)
                ctx = ctx+sntncList[i+1]+".";
            return ctx;
        }
    }

    return ctx;
}

//---------------------------------------------------------------------------
//
//---------------------------------------------------------------------------

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('manage.html')}, function(tab) {
    // Tab opened.
  });
});


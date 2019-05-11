var id = chrome.contextMenus.create({"title": "Familiarize!", "contexts": ["selection"], "onclick": onClick});
console.log("item: " + id);


var tab_code = `
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var to_parent = range.endContainer.isEqualNode(range.startContainer);
    var container = range.commonAncestorContainer;
    range.selectNode(container);
    if(to_parent){
        container = range.commonAncestorContainer;
        range.selectNodeContents(container);
    }
    range.toString();
`;

const popup_win_data = {
    url: "popup.html",
    type: "popup",
    width: 500,
    height: 600,
    left: 200,
    top: 20
};

var global_canon_word;
var global_contexts;
var global_last_word_date;

function take_target_def_if_all_forwarded(lang, word) {

    if (!lang)
        return
    console.log("==take_target_def_if_all_forwarded==");
    global_canon_word = word
    var forwarded_defs = 0
    var defs = 0
    var canon_words = []

    //for each part of speach (pos)
    for (var i = 0; i < lang.length; i++) {
        pos = lang[i]
        for (var j = 0; j < pos.definitions.length; j++) {
            defs++;
            def = pos.definitions[j]
            console.log(def)
            //this is a def of a type the links the original def (like a plural form with a link to the single form)
            if(def.definition.includes("form-of-definition") || def.definition.includes("use-with-mention")) {
                regex = /(title=)"([^"]+)"/g
                var title = def.definition.matchAll(regex)
                if(title) {
                    var title = Array.from(title)
                    title = title[title.length - 1][2]//title is the original "canonical" form
                    canon_words.push(title)
                    forwarded_defs++
                }
            }
        }
    }
    if (forwarded_defs === defs)//if all defs are forward defs then take the first forward target as the canonical
        global_canon_word = canon_words[0]
    console.log(global_canon_word)
}

var window_id = null;

function onClick(info, tab) {
    console.log("in generic click: ");
    console.log(info);
    console.log(tab);

    var letters = "\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A"
    var wordRegex = new RegExp("[" + letters + "]+(\\W*[" + letters + "]+)?");
    var word = wordRegex.exec(info.selectionText);
    word = word[0];
    console.log(word);
    if(word === null)
        return;

//1. english meaning - take only if there is in the lowercase
//2. german meaning - if the word is originaly lowercase - take the meaning
//                    if the word is not originaly lower case - take the upper case meaning if there is, othewise take the lowercase meaning
//if the word is uppercase and has a meaning as lowercase in English - take the english


    chrome.tabs.executeScript(tab.id, {code: tab_code},
         function(range) {
            ctx = naiveSentenceRec(range[0],word);
            var ctx = ctx.replace(/(<([^>]+)>)/ig,"");
            if(ctx===""){
                alert("You miss selected the word");
            }
            else{

                var upper_data = null;
                var created_tab = null;

                //called when the original word is upper case and it is reduced to lower case
                function process_wiki_json_low_case(data,text){
                    console.log("==process_wiki_json_low_case==");
                    console.log(data)
                    if (!data.en) {
                        data = upper_data
                        take_target_def_if_all_forwarded(data.de, word)
                    }
                    else {
                        take_target_def_if_all_forwarded(data.en, word.toLowerCase())
                    }
                    var word_data = localStorage_update_word(info.selectionText,global_canon_word,ctx,tab.url, Date());
                    global_contexts = word_data.contexts
                    global_last_word_date = word_data.date

                    if(created_tab) {
                        console.log("==message to pop==");
                        chrome.tabs.sendMessage(created_tab.id, data);
                    }
                }

                function process_wiki_json(data,text){
                    console.log("==process_wiki_json==");
                    console.log(text);//text is either "error" or "success"
                    console.log(data)

                    if (word === word.toLowerCase()) {
                        console.log("word is original low case")
                        take_target_def_if_all_forwarded(data.de, word)
                        take_target_def_if_all_forwarded(data.en, word)
                        var word_data = localStorage_update_word(info.selectionText,global_canon_word,ctx,tab.url, Date());
                        global_contexts = word_data.contexts
                        global_last_word_date = word_data.date

                        if(created_tab) {
                            console.log("==message to pop==");
                            chrome.tabs.sendMessage(created_tab.id, data);
                        }
                    }
                    else {
                        console.log("word is original UPPER CASE")
                        $.get("https://en.wiktionary.org/api/rest_v1/page/definition/"+encodeURI(word.toLowerCase()), process_wiki_json_low_case ).fail(process_wiki_json_low_case);
                        take_target_def_if_all_forwarded(data.de, word)
                        upper_data = data
                    }
                }
                global_canon_word = word

                //https://en.wiktionary.org/api/rest_v1/#!/Page_content/get_page_definition_term
                $.get("https://en.wiktionary.org/api/rest_v1/page/definition/"+encodeURI(word), process_wiki_json ).fail(process_wiki_json);
                chrome.windows.create(popup_win_data, function(window) {
                                                        //kill the previous popup when a new one is poped so not to flood with pop
                                                        if (window_id) {
                                                            console.log(window_id)
                                                            chrome.windows.remove(window_id);
                                                        }
                                                        created_tab = window.tabs[0]
                                                        window_id = window.id
                                                      });
            }
         });
}



/*
given a paragraph and a word , return the senetence in the paragraph where the word appear.
This code is a bit messy
*/
function naiveSentenceRec(paragraph ,word){
    //current implementation:
    //split the paragraph according to commas.
    //in the list, if a variable is not a new line, concate it to the one before.
    console.log("==naiveSentenceRec==")
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
    console
    //now we return the senetence of the word with the senetence before and after it.
    //word = word.replace(" ","\s");

    var ctxRegex = new RegExp("\\b"+word+"\\b");
    if (word.startsWith("ü") || word.startsWith("ä") || word.startsWith("ö") || word.startsWith("Ü") || word.startsWith("Ä") || word.startsWith("Ö"))
        ctxRegex = new RegExp(word+"\\b");
    ctx = "";
    var LIMIT_CTX_LENGTH = 200;
    console.log(sntncList.length)
    console.log(ctxRegex)
    for(var i=0;i<sntncList.length;i++){
        console.log(sntncList[i])
        if(ctxRegex.test(sntncList[i])){
            ctx = sntncList[i];
            if(i>0 && ctx.length<LIMIT_CTX_LENGTH && sntncList[i-1].length<LIMIT_CTX_LENGTH)
                ctx = sntncList[i-1]+"."+ctx;
            if(i+1<sntncList.length && ctx.length<LIMIT_CTX_LENGTH && sntncList[i+1]<LIMIT_CTX_LENGTH)
                ctx = ctx+"."+sntncList[i+1];
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

//----------------------------------------------------
//  a listerner to the massege sent from uploadToDrive
//  it uploads the data to google drive
//----------------------------------------------------

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    body = '--foo_bar_baz' +
        '\r\nContent-Type: application/json; charset=UTF-8' +
        '\r\n' +
        '\r\n{"name" : "familiar.json"}' +
        '\r\n' +
        '\r\n--foo_bar_baz' +
        '\r\nContent-Type: application/json' +
        '\r\n' +
        '\r\n' + JSON.stringify(localStorage_to_json()) +
        '\r\n' +
        '\r\n--foo_bar_baz--'

    chrome.identity.getAuthToken({interactive: true}, function(token) {
       console.log(token);
       console.log(chrome.identity.AccountInfo)

	    let init = {
          method: 'POST',
          async: true,
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'multipart/related; boundary=foo_bar_baz',
            'Content-Length': body.length
          },
	  'body': body
        };
        fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            init)
            .then((response) => response.json())
            .then(function(data) {
              console.log(data)
            });

     });
});

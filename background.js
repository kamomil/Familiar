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

function onClick(info, tab) {
    console.log("in generic click: ");
    console.log(info);
    console.log(tab);

    var wordRegex = /[a-zA-Z]+(\W*[a-zA-Z]+)?/;
    var word = wordRegex.exec(info.selectionText);
    word = word[0];
    console.log(word);
    if(word === null)
        return;

    chrome.tabs.executeScript(tab.id, {code: tab_code},
         function(range) {
            ctx = naiveSentenceRec(range[0],word);
            var ctx = ctx.replace(/(<([^>]+)>)/ig,"");
            if(ctx===""){
                alert("You miss selected the word");
            }
            else{
                var created_tab = null;

                function process_def_json(data,text){
                    console.log("==process_def_json==");
                    console.log(text);

                    if(created_tab !== null) {
                        chrome.tabs.sendMessage(created_tab.id, data);
                    }
                }
                global_canon_word = word.toLowerCase();
                global_contexts = update_contexts(info.selectionText,global_canon_word,ctx,tab.url, Date());

		function try_capital_case(){
                    console.log("fail with lower case try again with First letter up");
                    canon_first_upper =  global_canon_word.charAt(0).toUpperCase() + global_canon_word.slice(1);
                    $.get("https://en.wiktionary.org/api/rest_v1/page/definition/"+encodeURI(canon_first_upper), process_def_json ).fail(process_def_json);
		}

                //https://en.wiktionary.org/api/rest_v1/#!/Page_content/get_page_definition_term
                $.get("https://en.wiktionary.org/api/rest_v1/page/definition/"+encodeURI(global_canon_word), process_def_json ).fail(try_capital_case);
                chrome.windows.create(popup_win_data, function(window) {created_tab = window.tabs[0];} );
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

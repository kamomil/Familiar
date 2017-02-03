var id = chrome.contextMenus.create({"title": "add to my voc", "contexts": ["selection"], "onclick": onClick});
console.log("item: " + id);



//---------------------------------------------------------------------------
//
//---------------------------------------------------------------------------

function onClick(info, tab) {
    //console.log("item " + info.men   uItemId + " was clicked");
  //console.log("info: " + JSON.stringify(info));
  //console.log("tab: " + JSON.stringify(tab));
  console.log("in generic click: ");
  console.log(info);
  if(info.selectionText){
      chrome.tabs.executeScript(tab.id, {file: 'getSel.js'});
  }
}

//---------------------------------------------------------------------------
//
//---------------------------------------------------------------------------

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('manage.html')}, function(tab) {
    // Tab opened.
  });
});


//---------------------------------------------------------------------------
// the message which is sent from getSel.js is a dictionary of a context of a word
//---------------------------------------------------------------------------
chrome.extension.onRequest.addListener(function(message, sender, sendResponse) {
    var contexts;
    var def;
    var origWord = message.word;
    var usrWord = message.word.replace(/\W+/,"-").toLowerCase();
    console.log("in chrome.extension.onRequest.addListener");
    console.log("usrWord="+usrWord);


    function process_dict_result(data,text){

	      console.log("data: "+data);
	      console.log("$(data): "+$(data));
	      console.log("$(text): "+text);
	      
              var jdata = $(data);
	      //def = jdata;
              def = jdata.find('li').map(function() {// map is a callback, that means it asynchronius.
                  return $(this).text();
              }).get();

	      // jdata is the definition retrived from the dictionaryapi 
	      // we should parse it 

	      canonWord=usrWord // jdata.find('entry').first().attr('id');
	      console.log("background: canon #"+canonWord+"#");
	      
	      if(typeof(canonWord) == 'undefined')
	      {
		  alert("could not find the word");
		  console.log("background: could not find the word");
	      }
	      else
	      {

		  /* in case we found a valid definition from the www.dictionaryapi.com
		     we should see if we already have this word in the local storage*/
		  contexts = JSON.parse(localStorage.getItem(canonWord));
		  console.log("dfsdfdsf@@@@@@@@@@@@@@@@@@@@@@@@2")
		  console.log(localStorage.getItem(canonWord))

		  /*
		  chrome.storage.local.get(canonWord, function(items) {
		      console.log("StorageArea cb: "+items)
		  });
		  */
		  
		  /* word does not exist in the local storage: - add it*/
		  if(contexts === null){
		      console.log("background: first ctx for the word\n"+message.context);
		      contexts = [{ctx:message.context,orig_word:origWord}];
		  }
		  /* word already exist - add the current context to the existing list of contexts for this word*/
		  else{
		      console.log("found new ctx");
		      contexts.push({ctx:message.context,orig_word:origWord});
		  }
		  console.log("background: contexts=\n"+JSON.stringify(contexts));
		  localStorage.setItem(canonWord,JSON.stringify(contexts));
		  console.log("sadasd asdasd")

		  /***********/
		  //chrome.storage.sync.set({canonWord : contexts}, function() {
		      // Notify that we saved.
		  //    console.log('Settings saved');
		 // });
		  /**********/

		  /* create the popup with the list of contxts and the definition */
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
    }

    //$.get("http://www.dictionaryapi.com/api/v1/references/learners/xml/"+usrWord+"?key=1fa5d878-17a4-493f-b8c1-24966bf2c6db",
    $.get("https://en.wiktionary.org/wiki/"+usrWord,
    	  function(data,text){process_dict_result(data,text);}, "xml").fail(function(data,text){alert("failed "+text); process_dict_result(data,text);});
});

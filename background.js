var id = chrome.contextMenus.create({"title": "add to my voc", "contexts": ["selection"], "onclick": genericOnClick});
console.log("'" + "' item:" + id);



//---------------------------------------------------------------------------
// 
//---------------------------------------------------------------------------

function genericOnClick(info, tab) {
    //console.log("item " + info.men   uItemId + " was clicked");
  //console.log("info: " + JSON.stringify(info));
  //console.log("tab: " + JSON.stringify(tab));
  console.log("in generic click: ");
  console.log(info);
  if(info.selectionText){
      chrome.tabs.executeScript(tab.id, {file: 'getSel.js'});
  }
  ///////////
  //chrome.tabs.get(tab.id, function(tab){
  //   chrome.windows.get(tab.windowId, function(win){ 
  //         console.log(win); // THIS IS THE WINDOW OBJECT
//		   var sel = win.getSelection();
//			console.log("background.js: win.sel:"+sel.toString());
 //     });
//	});
  ///////////
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
    console.log("usrWord="+usrWord);
	
    
    $.get("http://www.dictionaryapi.com/api/v1/references/learners/xml/"+usrWord+"?key=1fa5d878-17a4-493f-b8c1-24966bf2c6db",
    	  function(data,text){
              var jdata = $(data);
              def = jdata.find('dt').map(function() {//TODO - map is a callback, that means it asynchronius. 
                  // return $(this).filter(function(){ return(this.nodeType == 3); }).text();
                  return $(this).text();
              }).get();
              canonWord=jdata.find('entry').first().attr('id');
              //alert("background: canon #"+canonWord+"#");
	      console.log("background: canon #"+canonWord+"#");
	      if(typeof(canonWord) == 'undefined')
	      {
		  alert("could not find the word");
		  console.log("background: could not find the word");
	      }
	      else
	      {
		  contexts = JSON.parse(localStorage.getItem(canonWord));
		  
		  if(contexts === null){   
		      console.log("background: first ctx for the word\n"+message.context);
		      contexts = [{ctx:message.context,orig_word:origWord}];
		  }
		  else{
		      console.log("found new ctx");
		      contexts.push({ctx:message.context,orig_word:origWord});
		  }
		  console.log("background: contexts=\n"+JSON.stringify(contexts));	
		  localStorage.setItem(canonWord,JSON.stringify(contexts));
		  
		 
		  /*******************/
		  /********/
		  console.log("about to create");
		  chrome.windows.create({url: "show_contexts_jquery.html", type: "popup", width: 200, height: 200}, function(tab){
		      /* this will be executed right after the create , before the html's js will run, so here we should add listener to the created html*/
		      console.log("bla");
		      chrome.runtime.onMessage.addListener(function listen(request, sender, sendResponse) {
			  console.log("in popup listener "+sender.tab);
			  console.log(request);
			  if (request.popup_ready)
			  {
			      console.log("got popup ready "+ canonWord);
			      sendResponse({"def" : def, "canonWord": canonWord, "contexts" : contexts});
			      chrome.runtime.onMessage.removeListener(listen);/* need to remove prevoud listener so there will always be only one*/
			  }
		      });//end of listener

		  });//end of windown.create callback
	      }
    	  }, "xml"); 
});


                              

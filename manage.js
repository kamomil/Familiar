/* the code in this file deal with the management of words and contexts (executed when the user clicks on the extension icon */

function clickClearAll(e) {
	if(confirm("sure?")){
		localStorage.clear();
		location.reload();
	}
}

/*
See http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
*/

function localStorage_to_json(){
	
    jarr = [];
    var length =localStorage.length;
    for(var i=0;i<length;i++){
	var word = localStorage.key(i);
	if (word !== null){
	    console.log("localStorage_to_json: word"+i+": "+word);
	    var contexts = JSON.parse(localStorage.getItem(word));
	    jarr.push({word:word,contexts:contexts});
	}
    }
    console.log(jarr);
    return {"words" : jarr};
}
function saveAsJson(e) {
	
	function download(filename, text) {
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
		pom.setAttribute('download', filename);
	
		
		console.log("here "+pom.getAttribute("href"));
		if (document.createEvent ) {
			console.log("here1 ");
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		}
		else {
			console.log("here2");
			pom.click();
		}
		
	}
	download('test.json', JSON.stringify(localStorage_to_json));
}


/* 
   this function is called when clicking the 'Clear Checked' button
   it clears all the checked items from the local storage
*/
function clickChecked(e){
    $("input").each(function(){
		var thisCheck = $(this);
		console.log("value="+thisCheck.attr("value"));
	   if (thisCheck.is(':checked') && thisCheck.attr("name") === "word")
	   {
		   console.log("word input - remove ");
		   localStorage.removeItem(thisCheck.attr("value"));
	   }
	   else if(thisCheck.is(':checked') && thisCheck.attr("name") === "context")
	   {
		   console.log("context input - remove ");
		   var ctxS = localStorage.getItem(thisCheck.attr("value"));
		   if(ctxS != null)
		   {
			   console.log("still exist");
			   var contexts = JSON.parse(ctxS); 
			   for(var j=0 ; j<contexts.length ; j++){	 
					if(contexts[j].ctx === thisCheck.text())
					{
						console.log("got the context");
						localStorage.setItem(thisCheck.attr("value"),JSON.stringify(contexts.splice(j,1)));
						break;
					}
				}
		   }
		   
	   }
	});
	location.reload();
}


function safe_json_parse(word){
    try{
        item = localStorage.getItem(word)
        console.log('--item--')
        console.log(item)
        console.log('--json--')
        console.log(JSON.parse(item))

        var contexts = JSON.parse(localStorage.getItem(word));
        return contexts;
    }
    catch(err){
        console.error("JSON could not parse "+ localStorage.getItem(word));
        return [];
    }
}

function mustache_render(jquey_id, view) {
  var tag = $(jquey_id);
  console.log(view)
  var rendered = Mustache.to_html(tag.html(), view);
  console.log(rendered)
  $(tag).html(rendered);
}


$(document).ready(function(){
    console.log("in manage ready");
    // Add event listeners once the DOM has fully loaded by listening for the
    // `DOMContentLoaded` event on the document, and adding your listeners to
    // specific elements when it triggers.
    $('#clearAll').bind('click',clickClearAll);
    $("#clearChecked").bind('click', clickChecked);
    $("#save").bind('click', saveAsJson);
    
    var length =localStorage.length;
    console.log("length of local storage = "+length);
    console.log(localStorage)
    view = []
    for(var i=0;i<length;i++){
        var word = localStorage.key(i);
        if (word !== null){

            var contexts = safe_json_parse(word);
            if(contexts)
                view.push({"word" : word, "contexts" : contexts})
        }
	}

	mustache_render('#words', {"words" : view})


    $('input[name="word"]').bind('click', function ()
                               {
                                   var thisCheck = $(this);
                                   if (thisCheck.is(':checked'))
                                   {
                                       $('input[name="context"][value="'+thisCheck.attr("value")+'"]').attr('checked', true);

                                   }
                               });
  $('input[name="context"]').bind('click', function ()
                               {
                                   var thisCheck = $(this);
                                   if (! thisCheck.is(':checked'))
                                   {
                                       $('input[name="word"][value="'+thisCheck.attr("value")+'"]').attr('checked', false);

                                   }
                               });
	
	
    
});


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
	var contexts = JSON.parse(localStorage.getItem(word));
	return contexts;
    }
    catch(err){
	console.error("JSON could not parse "+ localStorage.getItem(word));
	return null;
    }
}

/* generate the html file that shows all the words and their contexts in the local storage*/
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
    for(var i=0;i<length;i++){
	var word = localStorage.key(i);
	if (word !== null){
	    console.log("word"+i+": "+word);
	    $("body").append("<br><br><input type=\"checkbox\" name=\"word\" value=\""+word+"\" id=\""+i+"_"+word+"\"> WORD: "+word+"<br>");
	    console.log("after JSON parse ");
	    var contexts = safe_json_parse(word);
	    if(contexts !== null){
		console.log("not nu " + contexts);
		for(var j=0 ; j<contexts.length ; j++){	 
		    $("body").append("<input type=\"checkbox\" name=\"context\" value=\""+word+"\"  id=\""+i+"."+j+"\">"+contexts[j].ctx+"<br>");
		}
	    }  
	}
    }
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


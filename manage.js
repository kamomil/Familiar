

/* the code in this file deal with the management of words and contexts
(executed when the user clicks on the extension icon */


function clickClearAll(e) {
	if(confirm("sure?")){
		localStorage.clear();
		location.reload();
	}
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
	download('test.json', JSON.stringify(localStorage_to_json()));
}


/* 
   this function is called when clicking the 'Clear Checked' button
   it clears all the checked items from the local storage
*/
function clearChecked(e){
    $("input").each(function(){
		var thisCheck = $(this);
	   if (thisCheck.is(':checked') && thisCheck.attr("name") === "word")
	   {
		   console.log("word input - remove ");
		   localStorage.removeItem(thisCheck.attr("id"));
	   }
	   else if(thisCheck.is(':checked') && thisCheck.attr("name") === "context")
	   {
		   console.log("context input - remove ");
		   var word = localStorage.getItem(thisCheck.attr("value"));
		   if(word != null)
		   {
			   console.log("word exist");
			   var contexts = JSON.parse(word);
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

function mustache_render(jquey_id, view) {

//    var data;
//    data.view = view
//    data.hash = function () {
//        objectHash.sha1(this.view)
//    }

    var data = {
       "view":view,
        "hash": function () {
        return objectHash.sha1(view)
    }
   };



  var tag = $(jquey_id);
  var rendered = Mustache.to_html(tag.html(), data);
  $(tag).html(rendered);
}

$(document).ready(function(){

    console.log(document.getElementById('selectFiles').onclick)

    //https://stackoverflow.com/a/40581284/1019140
    //Trigger now when you have selected any file
    $("#selectFiles").change(function(e) {
          var files = document.getElementById('selectFiles').files;
          if (files.length <= 0) {
            return false;
          }
          var fr = new FileReader();
          fr.onload = function(e) {

              try{
                var json = JSON.parse(e.target.result);
              }
              catch(err){
                alert('bad json file')
              }
              console.log(json)
              if(!localstorage_validate_json(json)){
                console.log('invalid json')
                return
              }
              localstorage_add_from_json(json)
              location.reload();
          }
          fr.readAsText(files.item(0));
    })

    $('#selectFiles').on('click touchstart' , function(){
        $(this).val('');
    });


    console.log("in manage ready");
    // Add event listeners once the DOM has fully loaded by listening for the
    // `DOMContentLoaded` event on the document, and adding your listeners to
    // specific elements when it triggers.
    $('#clearAll').bind('click',clickClearAll);
    $("#clearChecked").bind('click', clearChecked);
    $("#save").bind('click', saveAsJson);

    var hash = objectHash.sha1({foo:'bar'});

    console.log("==hash==");
    console.log(hash);

    view = localStorage_to_json()
    console.log(view);
    console.log(objectHash.sha1(view));
	mustache_render('#words', localStorage_json_set_html(view))
	//mustache_render('#words', view)


    $('input[name="word"]').bind('click', function ()
                   {
                       var thisCheck = $(this);
                       if (thisCheck.is(':checked')){
                           console.log("aaaa")
                           $('input[name="context"][class="'+thisCheck.attr("class")+'"]').prop('checked',true);
                       }
                       else{
                           console.log("bbbb")
                           $('input[name="context"][class="'+thisCheck.attr("class")+'"]').prop('checked',false);
                       }
                   });
});


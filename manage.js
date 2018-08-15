
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

		if (document.createEvent ) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		}
		else {
			pom.click();
		}
	}
	download('familiar.json', JSON.stringify(localStorage_to_json()));
}


/* 
   this function is called when clicking the 'Clear Checked' button
   it clears all the checked items from the local storage
*/
function clearChecked(e){
    console.log("==clearChecked==")
    $("input:checked").each(function(){

	   if ($(this).attr("name") === "word")
		   localStorage.removeItem($(this).attr("id"));

	   else if($(this).attr("name") === "context")
           remove_context($(this).attr("value"),$(this).attr("id"))
	});
	location.reload();
}

function mustache_render(jquey_id, view) {

  var tag = $(jquey_id);
  var rendered = Mustache.to_html(tag.html(), view);
  $(tag).html(rendered);
}

$(document).ready(function(){

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

              if(!localstorage_validate_json(json)){
                console.warning('invalid json')
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

    $('#clearAll').bind('click',clickClearAll);
    $("#clearChecked").bind('click', clearChecked);
    $("#save").bind('click', saveAsJson);

    view = localStorage_to_json()
    view = localStorage_json_set_html(view)

    if(view.words.length == 0)
        view = {view:[]}
    else
        view = {view:view}
	mustache_render('#words', view)

    $('input[name="word"]').bind('click', function ()
       {
           if ($(this).is(':checked'))
               $('input[name="context"][class="'+$(this).attr("class")+'"]').prop('checked',true);
           else
               $('input[name="context"][class="'+$(this).attr("class")+'"]').prop('checked',false);
       });
});


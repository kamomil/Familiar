
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

function uploadToDrive(){
    chrome.runtime.sendMessage("uploadToDrive");
}

/* 
   this function is called when clicking the 'Clear Checked' button
   it clears all the checked items from the local storage
*/
function clearChecked(e){
    console.log("==clearChecked==");
    $("input:checked").each(function(){

	   if ($(this).attr("name") === "word")
		   localStorage.removeItem($(this).attr("id"));

	   else if($(this).attr("name") === "context")
           remove_context($(this).attr("value"),$(this).attr("id"));
	});
	location.reload();
}

function mustache_render(jquey_id, view) {

  var tag = $(jquey_id);
  var rendered = Mustache.to_html(tag.html(), view);
  $(tag).html(rendered);
}

var mus = `
{{#view}}
    <h3>Here are the words (in their contexts) you already encountered:</h3>
    <ol>
{{#view.words}}
<li class="word">
  <input type="checkbox" name="word" id="{{word}}" class="{{word}}_"> {{word}} ({{day}}/{{month}}/{{year}})

{{#contexts}}
 <ul>
     <li class="context"> <input type="checkbox" name="context" id="{{id}}" class="{{word}}_" value="{{word}}">{{{ctx}}}<a class="context" href="{{url}}" target="_blank">{{url}}</a></li>
 </ul>
{{/contexts}}

</li>
{{/view.words}}
        </ol>
{{/view}}
{{^view}}
    <h3>You didn't encounter any word yet</h3>
{{/view}}
`

function sortByDate() {
    view = localStorage_to_json(true);
    view = localStorage_json_set_html(view);
    words = view.words

    words.sort(function(a, b) {
        console.log(a)
        console.log(b)
        if (a.year > b.year)
            return -1
        else if (a.year < b.year)
            return 1
        if (a.month > b.month)
            return -1
        else if (a.month < b.month)
            return 1
        if (a.day > b.day)
            return -1
        else if (a.day < b.day)
            return 1
        return 0

    });
    view.words = words
    if(words.length == 0)
        view = {view:[]};
    else
        view = {view:view};
	var tag = $("#words");
	var rendered = Mustache.to_html(mus, view);
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
              var json_file;
              try{
                json_file = JSON.parse(e.target.result);
              }
              catch(err){
                alert('could not parse json file');
                return;
              }

              if(!localstorage_validate_json(json_file)){
                console.warning('invalid json');
                return;
              }
              localstorage_add_from_json(json_file);
              location.reload();
          };
          fr.readAsText(files.item(0));
    });

    $('#selectFiles').on('click touchstart' , function(){
        $(this).val('');
    });

    $('#clearAll').bind('click',clickClearAll);
    $("#clearChecked").bind('click', clearChecked);
    $("#save").bind('click', saveAsJson);
    $('#UplodaToDrive').bind('click',uploadToDrive)
    $('#SortByDate').bind('click',sortByDate)

    view = localStorage_to_json(true);
    view = localStorage_json_set_html(view);

    if(view.words.length == 0)
        view = {view:[]};
    else
        view = {view:view};
    var tag = $("#words");
    var rendered = Mustache.to_html(mus, view);
    $(tag).html(rendered);

    $('input[name="word"]').bind('click', function ()
       {
           if ($(this).is(':checked'))
               $('input[name="context"][class="'+$(this).attr("class")+'"]').prop('checked',true);
           else
               $('input[name="context"][class="'+$(this).attr("class")+'"]').prop('checked',false);
       });
});


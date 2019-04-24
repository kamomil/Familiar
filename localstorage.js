/*
the json format:
{
words: [

{"word" : word,
 "contexts" : [{"ctx" : context, orig_word : orig_word}, ...]
 "date" : date
 ...

 ]
}


}
*/

/*This function adds a new context, either from a json file or from a
  new world clicked.
  If it updates a context from a new clicked word then it update also the date
  of the word to the date of the new context.
*/

function update_word(origWord, canonWord, new_context,url, date){
      console.log("==update_word==")
      word_data = JSON.parse(localStorage.getItem(canonWord))
      var hash = objectHash.sha1({ctx:new_context,orig_word:origWord,url:url});
      var contexts = []

      /* word does not exist in the local storage: - add it*/
      if(word_data === null) {
          contexts = [{ctx:new_context,orig_word:origWord, id:hash,url:url}];
          word_data = {contexts: contexts, date:date}
      }
      /* word already exist - add the current context to the existing list of contexts for this word*/
      else {
          var contexts = word_data.contexts
          for(var i = 0; i<contexts.length;i++){
                if(contexts[i].ctx == new_context && contexts[i].orig_word == origWord){
                    console.log('context already clicked')
                    return word_data
                }
          }
          contexts.push({ctx:new_context,orig_word:origWord, id:hash, url:url});
          if (word_data.date < date)
                word_data.date = date
          word_data.contexts = contexts
      }
      localStorage.setItem(canonWord,JSON.stringify(word_data));
      return word_data;
}

function localStorage_json_set_html(json){
    console.log("== localStorage_json_set_html==")

    for(var i =0; i<json['words'].length; i++){
        console.log(json['words'][i])
        json['words'][i].contexts = contexts_to_html(json['words'][i].contexts)
    }

    return json
}

function remove_context(word,id){

    var word_data = localStorage.getItem(word);
    if(word_data != null)
    {
       var contexts = JSON.parse(word_data).contexts;
       for(var j=0 ; j<contexts.length ; j++){
            if(contexts[j].id === id)
            {
                contexts.splice(j,1)
                if(contexts.length == 0) {
                    localStorage.removeItem(word);
                } else {
                    word_data.contexts = contexts
                    localStorage.setItem(word,JSON.stringify(word_data));
                }
                return;
            }
        }
    }
}

function contexts_to_html(contexts){
    for(var i=0 ; i<contexts.length ; i++){
        var origWordRgx = new RegExp ("\\b"+contexts[i].orig_word+"\\b",'g');
        contexts[i].ctx = contexts[i].ctx.replace(origWordRgx,'<span class="word">'+contexts[i].orig_word+'</span>');
    }
    return contexts
}

//http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
function localStorage_to_json(){
    console.log("==localStorage_to_json==");
    view = []
    for(var i=0;i<localStorage.length;i++){
        var word = localStorage.key(i);
        var word_data = safe_localstorage_parse(word);
        console.log(i)
        console.log(word_data)
        view.push({"word" : word, "contexts" : word_data.contexts, "date" : word_data.date})
	}
	return {"words" : view};
}

function localstorage_add_from_json(json){
     console.log("==localstorage_add_from_json==")

     for(var i =0; i<json['words'].length; i++){
        jc_wc = json['words'][i]

        for(var k2 = 0;k2<jc_wc.contexts.length; k2++){
            update_word(jc_wc.contexts[k2].orig_word,  jc_wc.word, jc_wc.contexts[k2].ctx, jc_wc.contexts[k2].url, jc_wc.date)
        }
     }
}

function localstorage_validate_json(json){
     if(typeof json.words != "object" || !Array.isArray(json.words)){
        console.warning('wrong json 1')
        return false
     }
     for(var i =0; i<json.words.length; i++){
        wc = json.words[i]
        if(typeof wc.word != "string" || typeof wc.contexts != "object" || !Array.isArray(wc.contexts)){
            console.warning('wrong json 2')
            return false
        }
        for(var j=0;j<wc.contexts.length; j++){
            if(typeof wc.contexts[j].ctx != "string"
            || typeof wc.contexts[j].orig_word != "string"
            || typeof wc.contexts[j].url != "string"){
                console.warning('wrong json 3')
                return false
            }
        }
     }
     return true
}

function safe_localstorage_parse(word){
    try{
        item = localStorage.getItem(word)
        var word_data = JSON.parse(localStorage.getItem(word));
        return word_data;
    }
    catch(err){
        console.error("JSON could not parse "+ localStorage.getItem(word));
        return null;
    }
}
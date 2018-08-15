/*
the json format:
{
words: [

{"word" : word,
 "contexts" : [{"ctx" : context, orig_word : orig_word}, ...]
 "id" : id
 ...

 ]
}


}
*/

function update_contexts(origWord, canonWord, new_context,url){
      console.log("==update_contexts==")
      contexts = JSON.parse(localStorage.getItem(canonWord))
      var hash = objectHash.sha1({ctx:new_context,orig_word:origWord,url:url});

      /* word does not exist in the local storage: - add it*/
      if(contexts === null){
          contexts = [{ctx:new_context,orig_word:origWord, id:hash,url:url}];
      }
      /* word already exist - add the current context to the existing list of contexts for this word*/
      else{
          for(var i = 0; i<contexts.length;i++){
                if(contexts[i].ctx == new_context && contexts[i].orig_word == origWord){
                    console.log('context already clicked')
                    return contexts
                }
          }
          contexts.push({ctx:new_context,orig_word:origWord, id:hash, url:url});
      }
      localStorage.setItem(canonWord,JSON.stringify(contexts));
      return contexts;
}

function localStorage_json_set_html(json){
    console.log("== localStorage_json_set_html==")

    for(var i =0; i<json['words'].length; i++){
        json['words'][i].contexts = contexts_to_html(json['words'][i].contexts)
    }

    return json
}

function remove_context(word,id){

    var contexts_str = localStorage.getItem(word);
    if(contexts_str != null)
    {
       var contexts = JSON.parse(contexts_str);
       for(var j=0 ; j<contexts.length ; j++){
            if(contexts[j].id === id)
            {
                contexts.splice(j,1)
                if(contexts.length == 0)
                    localStorage.removeItem(word);
                else
                    localStorage.setItem(word,JSON.stringify(contexts));
                return;
            }
        }
    }
}

function contexts_to_html(contexts){
    for(var i=0 ; i<contexts.length ; i++){
        var origWordRgx = new RegExp (contexts[i].orig_word,'g');
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
        if (word !== null){

            var contexts = safe_json_parse(word);
            if(contexts)
                view.push({"word" : word, "contexts" : contexts})
        }
	}
	return {"words" : view};
}

function localstorage_add_from_json(json){
     console.log("==localstorage_add_from_json==")

     for(var i =0; i<json['words'].length; i++){
        jc_wc = json['words'][i]
        lc_contexts = safe_json_parse(jc_wc.word);
        for(var k2 = 0;k2<jc_wc.contexts.length; k2++){
            update_contexts(jc_wc.contexts[k2].orig_word,  jc_wc.word, jc_wc.contexts[k2].ctx, jc_wc.contexts[k2].url)
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

function safe_json_parse(word){
    try{
        item = localStorage.getItem(word)
        var contexts = JSON.parse(localStorage.getItem(word));
        return contexts;
    }
    catch(err){
        console.error("JSON could not parse "+ localStorage.getItem(word));
        return [];
    }
}
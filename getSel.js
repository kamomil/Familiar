if(sel){
	console.log("getSel.js: sel before :"+sel.toString());
}
var sel = window.getSelection();
console.log("getSel.js: sel after :"+sel.toString());
var range = sel.getRangeAt(0);
var selStr = sel.toString();
//var widerStr = widerRange.toString();


var wordRegex = /[a-zA-Z]+(\W*[a-zA-Z]+)?/;

	
var word = wordRegex.exec(selStr);

/*
  In case there was a selected word, confirm it with the user.
  If the user confirms, call chrome.extension.sendRequest({word:word,context:ctx}); with the word and the context
*/
if(word !== null){
    var continue_to_upper_parent = range.endContainer.isEqualNode(range.startContainer);
    word=word[0];
    
    var container = range.commonAncestorContainer;		
    range.selectNode(container);
	
    if(continue_to_upper_parent){
	container = range.commonAncestorContainer; 
	range.selectNodeContents(container);
    }
    //alert(range.toString());
    console.log("getSel.js: range.toString=\n"+range.toString());
    var ctx = range.toString();
    ctx = naiveSentenceRec(ctx,word);
    if(ctx===""){
	alert("You miss selected the word");
    }
    else{
	chrome.extension.sendRequest({word:word,context:ctx});
    }    
}
else{
	alert("the selected string is not a word");
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
    var LIMIT_CTX_LENGTH =200;
    for(var i=0;i<sntncList.length;i++){
	//alert(i+" "+sntncList[i]);
	if(ctxRegex.test(sntncList[i])){
	    ctx = sntncList[i]+".";
	    if(i>0 && ctx.length<LIMIT_CTX_LENGTH && sntncList[i-1].length<LIMIT_CTX_LENGTH)
		ctx = sntncList[i-1]+"."+ctx;
	    if(i+1<sntncList.length && ctx.length<LIMIT_CTX_LENGTH && sntncList[i+1]<LIMIT_CTX_LENGTH)
		ctx = ctx+sntncList[i+1]+".";
	    return ctx;
	}
    }
    
    return ctx;
}

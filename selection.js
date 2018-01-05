function getSelectSentence(){
	
	var selection = document.getSelection();

	var range = selection.getRangeAt(0)

	var curText = selection.toString();

	selection.modify("extend","left","sentence");
	var former = selection.toString();
	selection.modify("extend","right","sentence");
	var last = selection.toString();

	// last = last.replace(new RegExp(curText), "")

	selection.removeAllRanges()
	selection.addRange(range)

	return former + last;

}


function saveRange(){

	var saveNode = range.startContainer;

	var startOffset = range.startOffset;  // where the range starts
	var endOffset = range.endOffset;      // where the range ends

	var nodeData = saveNode.data;                       // the actual selected text
	var nodeHTML = saveNode.parentElement.innerHTML;    // parent element innerHTML
	var nodeTagName = saveNode.parentElement.tagName;   // parent element tag name


	var range = cDoc.createRange();

    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
}


function selectElementContents(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function selectNode(){
	var el = document.getElementById("foo");
	selectElementContents(el);
}


function recreateSelection(){

	document.getSelection().modify("extend","left","line");
	var r1 = document.getSelection().getRangeAt(0);

	document.getSelection().modify("extend","right","line");
	var r2 = document.getSelection().getRangeAt(0);

	var range = document.createRange();
	range.setStart(r1.startContainer, r1.startOffset);
    range.setEnd(endNode, endOffset);

    

}





// content.js

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	
  	// alert("content.js "+ JSON.stringify(request))

    if( request.key == "query" ) {
         // var firstHref = $("a[href^='http']").eq(0).attr("href");
      	chrome.runtime.sendMessage({"key": "crossquery", "word": request.word});
      	// alert(1)


// 			var url = "https://dict.hjenglish.com/jp/jc/" + request.word;
  //     	var container = $("<iframe id='wordmem'/>");
  //     	$(container).attr("src",url);



    }else if(request.key == "result"){

    	var style = "<style type=\"text/css\">\n" +
		"\t#wordmempanel {\n" +
		"\t    width: 304px;\n" +
		"\t    height: 222px;\n" +
		"\t    position: absolute;\n" +
		"\t    border: red solid 1.5px;\n" +
		"\t    left: 29px;\n" +
		"\t    top: 32px;\n" +
		"\t}\n" +
		"</style>\n" ;

		var div =  $("<div id=\"wordmempanel\">");

		var json = JSON.parse(request.content);
		$(div).html(json.content)


		$(div).css("left",pageX);
		$(div).css("top",pageY);

		$("html").append($(style));
		$("html").append($(div));


    }


  }
);

var selectedText;
var pageX;
var pageY;
document.addEventListener("mouseup", function(e) {
  	// var text = document.selection.createRange().text
  	selectedText = window.getSelection().toString();
  	pageX = e.pageX;
  	pageY = e.pageY;
});
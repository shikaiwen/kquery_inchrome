

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
		"\t    width: 266px; font-size:12px;\n" +
		"\t    padding: 10px;\n" +
		"\t    background-color: wheat;\n" +
		"\t    padding-bottom: 30px;\n" +
		"\t    z-index: 100;\n" +
		"\t    height: 222px;\n" +
		"\t    position: absolute;\n" +
		"\t    border: red solid 1.5px;\n" +
		"\t    left: 29px;\n" +
		"\t    top: 32px;\n" +
		"\t}\n" +
		"</style>\n" ;

		var div =  $("<div id=\"wordmempanel\">");

		var json = JSON.parse(request.content);

		// detail information
		// var holderElt = $("<div>").html(json.content);
		// var spanArr = $(holderElt).find("span");
		// var desc = $(holderElt).find("#hjd_wordcomment_1").val();
		


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


// jQuery(document).delegate("#wordmempanel","mouseout",function(e){
// 	$(this).remove()
// });


$(document).on("click",function(e){


	if($("#wordmempanel").length != 1 ) return;

	var ex = e.pageX;
	var ey = e.pageY;

	var rect = $("#wordmempanel")[0].getBoundingClientRect();
	var x = rect.x;
	var y = rect.y;
	var width = rect.width;
	var height = rect.height;

	if(!(  (ex > x && ey > y ) && (ex < (x + width)  && ey > y) && (ex >x && ey < (ey +height)) && (ex < (x + width) && ey < (y + height) )  )){
		$("#wordmempanel").remove();
	}

})


// jQuery(document).delegate("#wordmempanel","click",function(e){


// });




// var relayEvent = function(element, target, eventName, fn){

// 	var targetEl  = document.querySelector(target);
//   var elementEl = document.querySelector(element);
  
// 	elementEl.addEventListener(eventName, function(event){
//   	if (event.toElement === targetEl){
//       fn.call(this, event, event.toElement);
//     }
//   }, false);
// };

// relayEvent("#test", "a", "click", function(event, element){
// 	console.log(event, element);
// });
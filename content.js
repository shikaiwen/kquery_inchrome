

// content.js

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	
  	// alert("content.js "+ JSON.stringify(request))

    // if( request.key == "queryreq" ) {
    //   	chrome.runtime.sendMessage({"key": "query", "word": request.word});
    // }else 
    
    if(request.key == "queryresult"){

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

		var json = JSON.parse(request.msg.content);

		var currPageProtocal = location.href.substr(0,location.href.indexOf("/")+2)
		var relcnt = json.content.replace("http://",currPageProtocal);

		$(div).html(relcnt);

		// word(单词) jm(英文假名) roma(罗马假名) sd(声调) fyf(说明内容，用换行符号分割)
		var data = {
			"word": $(div).find("span.hjd_Green > font").html(),
			"jm":$(div).find("span:nth-child(2)").html(),
			"roma":$(div).find("span:nth-child(3)").html(),
			"sd":$(div).find("span:nth-child(4)").html(),
			"fyf":$(div).find("#hjd_wordcomment_1").val()
		}


		// change the word img if alreay been saved
		var pluginid = chrome.runtime.id;
		var imgdel = chrome.extension.getURL('btn_myword_del.gif');
		var imgadd = chrome.extension.getURL('btn_myword_add.gif');


		var img = $(div).find("#hjd_simple_amw_panel_1 img");
		img.attr("src",request.msg.exists == 1 ? imgdel : imgadd);

		img.attr("alt", request.msg.exists ?  "添加到生词本" :  "点击删除");
		img.parent().attr("title","点击删除");

		if(request.msg.exists){
			$(div).find("#hjd_simple_amw_panel_1").append($("<span>").html("已添加"));
		}
		

		

		$(div).attr("info",JSON.stringify(data));


		$(div).css("left",pageX);
		$(div).css("top",pageY);

		$("html").append($(style));
		$("html").append($(div));

    }else if(request.key == "savewordresult"){
    		var msg = request.msg;
    		if(msg.code == 1){

    		}
    }


  }
);

var selectedText;
var clientX;
var clientY;
var pageX;
var pageY;
document.addEventListener("mouseup", function(e) {
  	// var text = document.selection.createRange().text
  	selectedText = window.getSelection().toString();
  	clientX = e.clientX;
  	clientY = e.clientY;
  	pageX = e.pageX;
  	pageY = e.pageY;
});


// jQuery(document).delegate("#wordmempanel","mouseout",function(e){
// 	$(this).remove()
// });

$(document).delegate("#hjd_addword_image_1","click",function(){


	var pluginid = chrome.runtime.id;

	var imgurl = chrome.extension.getURL('btn_myword_del.gif');

	$(this).find("img").attr("src",imgurl);
	
	// var info = $.parseJSON($(this).parents("div").attr("info"));
	// chrome.runtime.sendMessage({"key": "saveword", "msg": info});

});

$(document).on("click",function(e){

	if($("#wordmempanel").length != 1 ) return;

	var ex = e.clientX;
	var ey = e.clientY;

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
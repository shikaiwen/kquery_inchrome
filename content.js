
// https://dev-trade.sbifxt.co.jp/web/pc/Home
//9972687425 000000 施凱文

// content.js


$(document).ready(function(){

	        $.ajax({
            url: chrome.extension.getURL('/template.html'),
            success: function(data) {
                templatesCnt = $('<div></div>').append($.parseHTML(data)).find('[type="template"]'),
                templatesCnt.each(function(){
                    templates[this.id] = this.innerHTML;
                });

                // return resolve(templates);
            }
        });

});



localres = {

	"btn_myword_del":chrome.extension.getURL('btn_myword_del.gif'),
	"btn_myword_add":chrome.extension.getURL('btn_myword_add.gif'),
}
templates = {};
pluginPageManager = {}
pluginPageManager.newWordPanel = function(){

	var template = templates["paneltemp"];
	template = $(template).clone();

	// 当ページに単語panel存在するかとかチェクします
	var existedPanelCnt = $(document).find("[name='wordmempanel']").length;
	$(template).attr("id","wordmempanel_"+existedPanelCnt );
	$(template).attr("name","wordmempanel_"+existedPanelCnt );

	return template;
}

pluginPageManager.nowordpaneltemp = function(){

	var template = templates["nowordpaneltemp"];
	template = $(template).clone();
	return template;
}


pluginPageManager.getTopPanel = function(){
	var list = $("[name^=wordmempanel]");
	return list.length >0 ? list[list.length -1] : null ;
}



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	
  	// alert("content.js "+ JSON.stringify(request))

    // if( request.key == "queryreq" ) {
    //   	chrome.runtime.sendMessage({"key": "query", "word": request.word});
    // }else 
    
    if(request.key == "queryresult"){


		 //$(templates.getPanel());

		var div =  $("<div>");

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

		var container = pluginPageManager.newWordPanel() 
		if(!data.word){
			container = pluginPageManager.nowordpaneltemp();

		}else{
			// 今、ダータをとったまま、設置します
			$(container).find("[name='word']").html(data.word);
			$(container).find("[name='jm']").html(data.jm);
			$(container).find("[name='roma']").html(data.roma);
			$(container).find("[name='sd']").html(data.sd);
			$(container).find("[name='fyf']").val(data.fyf);
			$(container).find("[name='fyfdetail']").html(data.fyf.split("\n").join("<br>"));
		}


		// change the word img if alreay been saved
		// var pluginid = chrome.runtime.id;
		// var imgdel = chrome.extension.getURL('btn_myword_del.gif');
		// var imgadd = chrome.extension.getURL('btn_myword_add.gif');
		// var img = $(container).find("#hjd_simple_amw_panel_1 img");
		// img.attr("src",request.msg.exists == 1 ? imgdel : imgadd);
		// img.attr("alt", request.msg.exists ? "点击删除" : "添加到生词本");
		// img.parent().attr("title", request.msg.exists ? "点击删除" : "添加到生词本");
		// if(request.msg.exists){
		// 	$(container).find("#hjd_simple_amw_panel_1").append($("<span>").html("已添加"));
		// 	$(img).attr("exists","1");
		// }
		

		$(container).attr("info",JSON.stringify(data));
		// エレメントのレイアウト設定
		$(container).css("left",pageX);
		$(container).css("top",pageY);
		$(container).append(templates.panelstyletemp);
		$("html").append($(container));

		initWordStatus(data.word);

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

// 単語の状態によって表示の文字を設定します
function initWordStatus(word){

	if(!word) return;
	var json = getCurrentPanelWordInfo();




	DB.syncGet(word).then(function(items) {

		var exists = (word in items) ? 1 : 0

		var pluginid = chrome.runtime.id;
		var imgdel = chrome.extension.getURL('btn_myword_del.gif');
		var imgadd = chrome.extension.getURL('btn_myword_add.gif');

		var container = pluginPageManager.getTopPanel();
		var img = $(container).find("#hjd_simple_amw_panel_1 img");
		img.attr("src", exists ? imgdel : imgadd);

		img.attr("alt", exists ? "点击删除" : "添加到生词本");
		img.parent().attr("title", exists ? "点击删除" : "添加到生词本");

		if (exists) {
			$(container).find("#hjd_simple_amw_panel_1").append($("<span>").html("已添加"));
			$(img).attr("exists", "1");
		}

	});



	// getSynData(word).then(function(data){
	// 	var exists = (word in data) ? 1 : 0 
	// 	var pluginid = chrome.runtime.id;
	// 	var imgdel = chrome.extension.getURL('btn_myword_del.gif');
	// 	var imgadd = chrome.extension.getURL('btn_myword_add.gif');
	// 	var container = $("#wordmempanel")
	// 	var img = $(container).find("#hjd_simple_amw_panel_1 img");
	// 	img.attr("src",exists ? imgdel : imgadd);

	// 	img.attr("alt", exists ? "点击删除" : "添加到生词本");
	// 	img.parent().attr("title", exists ? "点击删除" : "添加到生词本");

	// 	if(exists){
	// 		$(container).find("#hjd_simple_amw_panel_1").append($("<span>").html("已添加"));
	// 		$(img).attr("exists","1");
	// 	}
	// });

}



$(document).delegate("#hjd_addword_image_1","click",function(){


	var pluginid = chrome.runtime.id;

	var imgurl = chrome.extension.getURL('btn_myword_del.gif');

	var exists = $(this).attr("exists")

	var json = getCurrentPanelWordInfo(this);
	
	var data = {
		"word":json.word ,
		"exists":exists
	}
	var wordkey = json["word"];
	var timestamp = new Date().getTime();

	var syndata = {}
	var wordkey = json.word;
	syndata[wordkey] = json;

	DB.syncSet(syndata).then(function(result){
		initWordStatus(json.word)
	});


	// chrome.runtime.sendMessage({"key": "saveoraddword", "msg": json});
	// $(this).find("img").attr("src",imgurl);
	
	// var info = $.parseJSON($(this).parents("div").attr("info"));
	// chrome.runtime.sendMessage({"key": "saveword", "msg": info});

});



$(document).delegate("#wordlib","click",function(){
	var pluginId = chrome.runtime.id;
	datatube.front.request_openTab("chrome://extensions/"+pluginId+"/wordlib.html")
});



chrome.storage.onChanged.addListener(function(changes, namespace) {
for (key in changes) {
  var storageChange = changes[key];
  console.log('Storage key "%s" in namespace "%s" changed. ' +
              'Old value was "%s", new value is "%s".',
              key,
              namespace,
              storageChange.oldValue,
              storageChange.newValue);
}
});


var DB = {}
DB.set = function(data,callback){
	chrome.storage.sync.set(data, function(items) {
		callback(items);
	});
}
DB.syncSet = function(data){

	const promise = new Promise(function(resolve, reject) {
		chrome.storage.sync.set(data, function(items) {
			resolve(items);
		});
	});
	return promise;
}


DB.syncGet = function(word){

	const promise = new Promise(function(resolve, reject) {
		chrome.storage.sync.get(word, function(items) {
			resolve(items);
		});
	});

	return promise;
}

DB.get = function(data, callback) {

	chrome.storage.sync.get(data, function(items) {
		callback(items);
	});
}


function getCurrentPanelWordInfo(eltInPanel){


	var parentDiv = pluginPageManager.getTopPanel();
	if(!parentDiv) return;
	var info = $(parentDiv).attr("info")
	if(!info) return;
	var infojson = $.parseJSON(info)
	return infojson;
}


$(document).on("click",function(e){

	var panel = pluginPageManager.getTopPanel();
	if(!panel) return;

	var ex = e.clientX;
	var ey = e.clientY;

	var rect = panel.getBoundingClientRect();
	var x = rect.x;
	var y = rect.y;
	var width = rect.width;
	var height = rect.height;

	if(!(  (ex > x && ey > y ) && (ex < (x + width)  && ey > y) && (ex >x && ey < (ey +height)) && (ex < (x + width) && ey < (y + height) )  )){
		$(panel).remove();
	}

	initWordStatus()

});



// バクグランドとのコミュニケーション対象
// Background = {}
// Background.openTab = function(url){

//      chrome.runtime.sendMessage({"key": "openTab", "url": url});

// }

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
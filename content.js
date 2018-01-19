
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

pluginPageManager.newQueryPanel = function(){
	var template = templates["queryPaneltemp"];
	template = $(template).clone();
	return template;
}

pluginPageManager.getTopPanel = function(){
	var list = $("[name^=wordmempanel]");
	return list.length >0 ? list[list.length -1] : null ;
}

function showQueryPanel(){

	if($("#querypanel").length >0)return;
	$(document).delegate("#querypanel #closeIcon img", "click", function(){
		$("#querypanel").remove();
	});

	var panel = pluginPageManager.newQueryPanel()

	$(panel).css("left",pageX);
	$(panel).css("top",clientY);


	// $(panel).append(templates.panelstyletemp);
	
	$("#closeIcon img").attr("src", chrome.extension.getURL('cancel.png'));
	$(panel).find("[name='qword']").focus();
	$("html").append($(panel));

	// $(panel).draggable();
	var draggableDiv = $('.querypanel');
	draggableDiv.draggable({
	  handle: $('.qptitlebar', draggableDiv)
	});


}

// 点击查询按钮
$(document).delegate("#querypanel #queryBtn", "click",function(){
	var word = $(this).siblings("input").val();
	queryPanelQuery(word);
});

$(document).delegate("#querypanel [type='input']", "keydown",function(e){
	if(e.keyCode == 13){
		var word = $(this).val();	
		queryPanelQuery(word);
	}

});

$(document).delegate(".contextLink", "click",function(e){
		var textarea = $(this).siblings("textarea") 
		var visible = textarea.is(":visible")
		if(visible){
			$(textarea).hide();
		}else{
			$(textarea).show();
		}
});


function queryPanelQuery(word){
	datatube.front.request_queryWord(word,function(request){
		var container = renderQueryResult(request)
		$(container).removeClass("wordmempanel")
		$("#querypanel #queryResultCnt").html(container);


		if(!$(container).attr("info")) return;

		var info = $.parseJSON($(container).attr("info"))

		DB.exist(info["word"],function(exist,data){
			
			if(exist && data.context){
				$(container).find("textarea").val(data["context"]);
			}else{
				var context = Selection.getSelectSentence().trim();
				$(container).find("textarea").val(context);
			}
		});


	});
}



function renderQueryResult(request){

	var div =  $("<div>");

	var json = JSON.parse(request);

	var currPageProtocal = location.href.substr(0,location.href.indexOf("/")+2)
	var relcnt = json.content.replace("http://",currPageProtocal);


	$(div).html(relcnt);

	// word(单词) jm(英文假名) roma(日语读音) sd(声调) fyf(说明内容，用换行符号分割)
	var data = {
		"word": $(div).find("span.hjd_Green > font").html(),
		"roma":$(div).find("span:nth-child(2)").html(),
		"jm":$(div).find("span:nth-child(3)").html(),
		"sd":$(div).find("span:nth-child(4)").html(),
		"fyf":$(div).find("#hjd_wordcomment_1").val()
	}

	var container = pluginPageManager.newWordPanel() 
	if(!data.word){
		container = pluginPageManager.nowordpaneltemp();

	}else{
		// 今、ダータをとったまま、設置します
		$(container).find("[name='word']").html(data.word);	//单词
		$(container).find("[name='jm']").html(data.jm);   //日文假名， 沪江词典命名弄反了，这里修正过来
		$(container).find("[name='roma']").html(data.roma);  //罗马音
		$(container).find("[name='sd']").html(data.sd);  //　声调 0
		$(container).find("[name='fyf']").val(data.fyf); //明细隐藏域
		$(container).find("[name='fyfdetail']").html(data.fyf.split("\n").join("<br>"));

		$(container).attr("info",JSON.stringify(data));
	}

	

	initWordStatus(data.word);
	return container;

}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	
    if(request.key == "queryresult"){

		var container = renderQueryResult(request.val)
		// エレメントのレイアウト設定
		$(container).css("left",pageX);
		$(container).css("top",pageY);
		$("html").append($(container));

		if(!$(container).attr("info")) return;

		var info = $.parseJSON($(container).attr("info"))

		DB.exist(info["word"],function(exist,data){
			
			if(exist && data.context){
				$(container).find("textarea").val(data["context"]);
			}else{
				var context = Selection.getSelectSentence().trim();
				$(container).find("textarea").val(context);
			}
		});

    }else if(request.key == "savewordresult"){
    	var msg = request.msg;
    	if(msg.code == 1){
    	}
    }else if(request.key == "showQueryPanel"){

		showQueryPanel()
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

		$(img).attr("exists", exists);

		if (exists) {
			// $(container).find("#hjd_simple_amw_panel_1").append($("<span>").html("已添加"));
		}

	});

}



//添加生词本
$(document).delegate("#hjd_addword_image_1 img","click",function(){

	var pluginid = chrome.runtime.id;

	var imgurl = chrome.extension.getURL('btn_myword_del.gif');

	var exists = $(this).attr("exists")

	var json = getCurrentPanelWordInfo(this);

	var context = $(this).parents(".wordmempanel").find("textarea").val()
	json["context"] = context;

	var data = {
		"word":json.word,
		"exists":exists
	}

	if(exists == 1){
		chrome.storage.sync.remove(json.word, function(items) {
			initWordStatus(json.word);
		});

	}else{

		var wordkey = json["word"];
		var timestamp = new Date().getTime();
		json.timestamp = timestamp;
		var syndata = {}
		var wordkey = json.word;
		syndata[wordkey] = json;

		DB.syncSet(syndata).then(function(result){
			initWordStatus(json.word);
		});
	}



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



function getCurrentPanelWordInfo(eltInPanel){


	var parentDiv = pluginPageManager.getTopPanel();
	if(!parentDiv) return;
	var info = $(parentDiv).attr("info")
	if(!info) return;
	var infojson = $.parseJSON(info)
	return infojson;
}

$(document).delegate(".panelLock", "click", function(){


	var locked = $(this).attr("locked");
	$(this).attr("locked", locked == "1" ? "0":"1");
	$(this).text(locked == "1" ? "Lock":"Unlock");

	if($(this).parents("#querypanel").length == 0 ) {

		var draggableDiv = $(this).parents(".wordmempanel")

		if($(this).attr("locked") == "1"){
			draggableDiv.draggable({
			  handle: $('.wordpaneltitlebar', draggableDiv)
			});
			$(draggableDiv).find(".wordpaneltitlebar").css("cursor","move");
			draggableDiv.draggable("enable")
		}else{
			$(draggableDiv).find(".wordpaneltitlebar").css("cursor","");
			draggableDiv.draggable("disable")
		}

		
	}

});

$(document).on("click",function(e){

	var panel = pluginPageManager.getTopPanel();
	if(!panel) return;

	//もし、父はquerypanel、閉じない
	if($(panel).parents("#querypanel").length>0) return;

	if($(panel).find(".panelLock").attr("locked") == "1"){
		return;
	}
	

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


document.onmouseup = document.onkeyup = document.onselectionchange = function() {
  	currentSelectedText = getSelectionText();
};

function getSelectionText() {
    var text = "";
    var activeEl = document.activeElement;
    var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
      (activeElTagName == "textarea") || (activeElTagName == "input" &&
      /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
      (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}





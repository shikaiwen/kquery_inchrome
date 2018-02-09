
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


pluginPageManager.getQueryPanel = function(){
	var id ="querypanel";
	return $("#"+id);
}

function showQueryPanel(){

	// if(QueryPanel.elt) return;
	$(document).delegate("#querypanel #closeIcon img", "click", function(){
		QueryPanel.elt.remove();
	});

	var panel = pluginPageManager.newQueryPanel();

	QueryPanel.elt = panel;

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

	nav = new QueryNavigator();
	nav.init();

	getTodayWordContent(panel);
}

//获取今日词汇
function getTodayWordContent(querypanel){
	callback = function(wordinfo){
		$(querypanel).find("#queryResultCnt").html(wordinfo);
	}
	datatube.front.request_getTodayWordContent(callback);


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

var QueryPanel = {};
QueryPanel.elt;
QueryPanel.reset = function(){
	QueryPanel.elt.find($("[name~=wordmempanel_]")).remove();
}


function QueryNavigator(){
	this.holder = [];
	this.preElt =  $("#arrow_back");
	this.nextElt = $("#arrow_forward");
	this.curIndex = -1;

	this.init = function(){

		var that = this;
		$(this.preElt).click(function(){
			if(--that.curIndex <= 0){
				that.curIndex = 0;
			}

			QueryPanel.reset();
			QueryPanel.elt.find("#queryResultCnt").children().remove().append(this.holder[that.curIndex]);

			that.refreshNav();
		});

		$(this.nextElt).click(function(){
			++that.curIndex;
			if(that.holder.length == 0){
				that.curIndex = 0;
			}else if(that.curIndex >= that.holder.length){
				that.curIndex = that.holder.length;
			}
			that.refreshNav();
		});

		this.refreshNav();
	}

	this.evthandler = function(word, container){
	}

	this.enable = function(elt){
		$(elt).css("color","");
		$(elt).on("mouseenter",function(){
			   $(this).css("background-color", "rgb(206, 202, 202)");
		}).on("mouseleave", function(){
				$(this).css("background-color", "");
		});
	}

	this.disable = function(elt){
		$(elt).css("color","rgba(0, 0, 0, 0.26)");
		 $(this).css("background-color", "");
		$(elt).off("mouseenter").off("mouseleave");
	}
	
	this.addResult = function(word,rescontainer){

		var lastone = this.holder[this.holder.length -1];
		if(lastone && word == lastone.word) return;
		this.holder.push({word:word,container:rescontainer});
		this.curIndex++;

		this.refreshNav()
	}

	this.refreshNav = function(){

		if(this.holder.length == 0){
			this.disable(this.preElt);
			this.disable(this.nextElt);
			return;
		}

		this.enable(this.preElt);
		this.enable(this.nextElt);


		if(this.curIndex == 0){
			this.disable(this.preElt);
		}
		if(this.curIndex == (this.holder.length-1)){
			this.disable(this.nextElt);
		}
		
	}

}

function queryPanelQuery(word){
	datatube.front.request_queryWord(word,function(request){
		var container = renderQueryResult(request);
		$(container).removeClass("wordmempanel");
		$("#querypanel #queryResultCnt").html(container);

		nav.addResult(word, container);

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



function renderQueryResult(dataArr){


	if(dataArr.length == 0){
		container = pluginPageManager.nowordpaneltemp();
	}else{
		var container = pluginPageManager.newWordPanel() 
		// 今、ダータをとったまま、設置します
		dataArr.forEach(function(data,i){
			var wordtmp = $(container).find("#wordmempanel_word_tmp").clone().attr("id","").show();
			$(wordtmp).find("[name='word']").html(data.word);	//单词
			$(wordtmp).find("[name='jm']").html(data.jm);   //日文假名， 沪江词典命名弄反了，这里修正过来
			$(wordtmp).find("[name='roma']").html(data.roma);  //罗马音
			$(wordtmp).find("[name='sd']").html(data.sd);  //　声调 0
			$(wordtmp).find("[name='fyf']").val(data.fyf); //明细隐藏域
			$(wordtmp).find("[name='fyfdetail']").html(data.fyf.split("\n").join("<br>"));

			$(wordtmp).attr("info",JSON.stringify(data));
			$(wordtmp).insertAfter($(container).find(".wordpaneltitlebar"))
		});

		
	}
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

		// if(!$(container).attr("info")) return;
		if(request.val.length == 0) return;

		
		var info = $.parseJSON($(container).find(".wordmempanel_word").first().attr("info"));
		initWordStatus(info.word);
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
	var json = getCurrentPanelWordInfo()[0];

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

	var jsonArr = getCurrentPanelWordInfo(this);
	if(exists == 1){
		chrome.storage.sync.remove(jsonArr[0].word, function(items) {
			initWordStatus(jsonArr[0].word);
		});
	}else{

		var savejson = jsonArr[0];
		var context = $(this).parents(".wordmempanel").find("textarea").val();
		savejson.context = context;
		savejson.timestamp = new Date().getTime();
		//添加同时查出的意思
		savejson.linkwordsinfo =  jsonArr.filter(function(v,i){
			return i>0;
		});
		var syndata = {};
		var wordkey = savejson.word;
		syndata[wordkey] = savejson;

		DB.syncSet(syndata).then(function(result){
			initWordStatus(wordkey);
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
	var contextArr = $(parentDiv).find(".wordmempanel_word").not("#wordmempanel_word_tmp").toArray().reduce(function(acc,v){
		acc.push($.parseJSON($(v).attr("info")));
		return acc;
	},[])
	return contextArr;
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





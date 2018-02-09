

String.prototype.trimAll = function(){
  var str = this.replace(/\s/g, "")
  return str;
}

// Create a parent item and two children.
var parent = chrome.contextMenus.create({
	"title": "show query panel",
	"onclick": function(){
    sendToActiveTab({"key":"showQueryPanel"})
  }
});

chrome.contextMenus.create({
  title: "search %s in dictionary",
  contexts: ["selection"],
  onclick: function(info,tab){
      var text = info.selectionText;
      toQuery(text);
  }
});




chrome.commands.onCommand.addListener(function(command) {

    chrome.windows.getCurrent(function(browser){

      if(browser.focused){
        // alert(chromeInFocus)
          datatube.backend.request_getSelectedText(function(text){
              toQuery(text);
          });
      }else{
        // alert(chromeInFocus)
          doGlobalQuery();
      }

    });





  // chrome.tabs.query({
  //   active: true,
  //   currentWindow: true
  // }, function(tabs) {
  //   if(!tabs[0]){
  //       alert(JSON.stringify(tabs))
  //   }else{
  //   }
  // });


});

function doGlobalQuery(){
  
  var clipData = getFromClipBoard();
  if(!clipData)return;

  doQuery(clipData,function(neededHtml){

    var json = JSON.parse(neededHtml);

    var currPageProtocal = location.href.substr(0,location.href.indexOf("/")+2)
    var relcnt = json.content.replace("http://",currPageProtocal);
    var div = $("<div>");
    $(div).html(relcnt);

    // word(单词) jm(英文假名) roma(罗马假名) sd(声调) fyf(说明内容，用换行符号分割)
    var data = {
      "word": $(div).find("span.hjd_Green > font").html(),
      "roma":$(div).find("span:nth-child(2)").html(),
      "jm":$(div).find("span:nth-child(3)").html(),
      "sd":$(div).find("span:nth-child(4)").html(),
      "fyf":$(div).find("#hjd_wordcomment_1").val()
    }
    var arr = [data.word +";" + data.jm + " "+data.sd, data.fyf];
    if(data.word){
      alert(arr.join("\n"));  
    }else{
      alert("未查询到单词:" + clipData); 
    }

    
  });


  

}

function getFromClipBoard(){
  // alert( chrome.extension.getBackgroundPage())
  bg = chrome.extension.getBackgroundPage();        // get the background page
  bg.document.body.innerHTML= "";                   // clear the background page

  // add a DIV, contentEditable=true, to accept the paste action
  var helperdiv = bg.document.createElement("div");
  document.body.appendChild(helperdiv);
  helperdiv.contentEditable = true;

  // focus the helper div's content
  var range = document.createRange();
  range.selectNode(helperdiv);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  helperdiv.focus();    

  // trigger the paste action
  bg.document.execCommand("Paste");

  // read the clipboard contents from the helperdiv
  var clipboardContents = helperdiv.innerHTML;

  // clipboardWant = clipboardContents;
  // return;

  var isHtmlData = true;

  if(clipboardContents.indexOf("table>")!= -1 
   || clipboardContents.indexOf("td>") != -1
   || clipboardContents.indexOf("font>") != -1
   || clipboardContents.indexOf("span>") != -1
   ){
    // getTextDesendent($(clipboardContents))
    return $(clipboardContents).text().trim();
  }else{
    return clipboardContents;
  }

  // datatube.backend.request_getSelectedText(function(text){
  //     toQuery(text);
  // });
}

var clipboardWant = "";
function getTextDesendent(elt){
  
  var children = $(elt).contents()
  for(var v=0; v<children.length; v++){
    var item = children[v]
    if(item.nodeType == Node.TEXT_NODE){
        var text = $.trim($(item).text());
        if(text){
          clipboardWant = text;
        }
    }else{
      getTextDesendent(item);
    }
  }
}


var getTextNodesIn = function(el) {
    return $(el).find(":not(iframe)").addBack().contents().filter(function() {
        return this.nodeType == 3;
    });
};






function toQuery(text){
  if(!$.trim(text)) return;

  doQuery($.trim(text), function(neededHtml){
    
      var returnobj = {
        key:"queryresult",
        val: {}
      }

      returnobj.val = neededHtml;
      var userid = "me";
      sendToActiveTab(returnobj);
  });
}



function doQuery(word, callback){

    var url = "https://dict.hjenglish.com/services/simpleExplain/jp_simpleExplain.ashx?type=jc&w="+word;
    // chrome.tabs.create({"url": url});
    // alert("background.js "+ JSON.stringify(request))
    var url = "https://dict.hjenglish.com/jp/jc/"+ word

    $.post(url,function(xhr){

        // var neededHtml = xhr.substr(xhr.indexOf("{"),xhr.lastIndexOf("}") - xhr.indexOf("{") +1)
        // var replaceArr = ["content","IfHasScb","hjd_langs","WordId","FromLang","ToLang"]
        // for (var i = 0; i < replaceArr.length; i++) {
        //   neededHtml = neededHtml.replace(""+replaceArr[i], "\"" + replaceArr[i] + "\"")
        // }
        // var htmlCnt = $.parseJSON(unicodeToChar(neededHtml)).content;
        // var container = $("<div>").html(htmlCnt);

  var headerElt = $(container).find(".hjd_Green");
  var wordInfoArr = [];

    $(headerElt).each(function(i,v){
  //日文假名， 沪江词典命名弄反了，这里修正过来
  var data = {};
  data.word = $(this).find("font").html();
  data.roma = $(this).nextAll("[title*=假名]").first().html()
  data.jm = $(this).nextAll("[title*=罗马音]").first().html()
  data.sd = $(this).nextAll("[title*=声调]").first().html()
  data.fyf = $(this).nextAll("[id*=hjd_wordcomment]").first().val()


var data = {}
data.word = $(".word-details-pane").eq(0).find(".word-info .word-text").text().trimAll();
data.jm = $(".word-details-pane").eq(0).find(".word-info .pronounces span").eq(0).text().trimAll();
data.roma =$(".word-details-pane").eq(0).find(".word-info .pronounces span").eq(1).text().trimAll();
data.sd = $(".word-details-pane").eq(0).find(".word-info .pronounces span").eq(2).text().trimAll();
// data.fyf = 

  // neededHtml = unicodeToChar(neededHtml) 
  wordInfoArr.push(data);
});

  // word(单词) jm(英文假名) roma(日语读音) sd(声调) fyf(说明内容，用换行符号分割)

        callback(wordInfoArr);

    });


}

$(function(){
  dataHandle()  
})

// html page data handle
function dataHandle(xhr,callback){

    var url = "https://dict.hjenglish.com/jp/jc/留まる"

    $.get(url,function(xhr){
        var context = $(xhr);
        var result = [];

        context.find(".word-details-pane").each(function(){
          var data = {};
          data.word = $(this).find(".word-info .word-text").text().trimAll();
          data.jm = $(this).find(".word-info .pronounces span").eq(0).text().trimAll();
          data.roma = $(this).find(".word-info .pronounces span").eq(1).text().trimAll();
          data.sd = $(this).find(".word-info .pronounces span").eq(2).text().trimAll();
          data.wordtype = $(this).find(".simple span").eq(0).text().trimAll();
          data.simpleDefinition = $(this).find(".simple span").eq(1).text().trimAll();
            // data.fyf = 
            // [{word}]
        // data.sentences = {"意味１":[{},{}]],"意味２":[{},{}]]}
          var sens = {};
          $(this).find(".word-details-item .detail-groups dd").each(function(){
            var meaning = $(this).find("h3").text().trimAll();
            var sentencesArr = $(this).find("ul li").toArray().reduce(function(acc, v, i){
                var fromSentence = $(v).find("p").eq(0).text().trimAll();
                var toSentence = $(v).find("p").eq(1).text().trimAll();
                var senitem = {};
                senitem[fromSentence] = toSentence;
                acc.push(senitem);
                return acc;
            }, []);

            sens[meaning] = sentencesArr;
          });
          
          data.sentences = sens;

          result.push(data);
        });

        callback(result)
    });



  
}


chrome.runtime.onMessage.addListener(

  function(request, sender, sendResponse) {

    if( request.key == "query" ) {
    	// var url = "https://dict.hjenglish.com/jp/jc/" + request.word;
 


    }



    if(request.key == "saveword"){
        var info = request.msg;

          $.ajax({
            method:"POST",
            data:info,
            url:"http://127.0.0.1:8000/polls/chrome_kquery/saveword",
            complete:function(xhr){
              var resp = xhr.responseText

              var data = {
                key:"savewordresult",
                msg:resp
              }
              sendToActiveTab(data);
            },
            success:function(xhr){

            },
            error:function(xhr){
              alert("access error:"+ url)
            }
        });


    }

  }
);


function sendToActiveTab(data) {

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		var activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, data);
    // chrome.runtime.sendMessage(data);
	});

}


function unicodeToChar(text) {
   return text.replace(/\\u[\dA-F]{4}/gi, 
          function (match) {
               return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });
}


// HJ.fun.jsonCallBack({content:"<span class='hjd_Green' title='\u65E5\u8BED\u5355\u8BCD'>[<font color=red>\u756A\u53F7</font>]</span> <span title='\u5047\u540D'>[banngou]</span> <span class='hjd_Orange' title='\u7F57\u9A6C\u97F3'>[\u3070\u3093\u3054\u3046]</span> <span title=\"\u58F0\u8C03\" class=\"hjd_Orange\">\u2462</span><span title=\"\u65E5\u8BED\u53D1\u97F3\"></span><span id=\"hjd_simple_amw_panel_1\" class=\"hjd_add_myword\"><a id='hjd_addword_image_1' href='###' class='hjd_simple_addword_image' onclick = 'HJ.fun.AddSimpleJpWord(1);return false' title = '\u6DFB\u52A0\u5230\u6211\u7684\u751F\u8BCD\u672C'><img align='absmiddle' src ='http://dict.hjenglish.com/images/btn_myword_add.gif' alt='\u6DFB\u52A0\u5230\u6211\u7684\u751F\u8BCD\u672C' width='16' height='16' /></a></span><br/><input type=\"hidden\" value=\"\u756A\u53F7\" id=\"hjd_amw_word_1\"/><input type=\"hidden\" value=\"\u3010\u540D\u8BCD\u3011 \r\n\u53F7\u7801\uFF0C\u53F7\u6570\uFF0C\u53F7\u5934\u3002\r\n\r\n\" id =\"hjd_wordcomment_1\"/><b>\u3010\u540D\u8BCD\u3011</b> <br/>\u53F7\u7801\uFF0C\u53F7\u6570\uFF0C\u53F7\u5934\u3002<br/><br/>",IfHasScb:"False",hjd_langs:"jc",WordId:"0",FromLang:"Jp",ToLang:"Cn"});HJ.fun.changeLanguage('jc');

// HJ.fun.jsonCallBack({
// 	content: "<span class='hjd_Green' title='\u65E5\u8BED\u5355\u8BCD'>[<font color=red>\u756A\u53F7</font>]</span> <span title='\u5047\u540D'>[banngou]</span> <span class='hjd_Orange' title='\u7F57\u9A6C\u97F3'>[\u3070\u3093\u3054\u3046]</span> <span title=\"\u58F0\u8C03\" class=\"hjd_Orange\">\u2462</span><span title=\"\u65E5\u8BED\u53D1\u97F3\"></span><span id=\"hjd_simple_amw_panel_1\" class=\"hjd_add_myword\"><a id='hjd_addword_image_1' href='###' class='hjd_simple_addword_image' onclick = 'HJ.fun.AddSimpleJpWord(1);return false' title = '\u6DFB\u52A0\u5230\u6211\u7684\u751F\u8BCD\u672C'><img align='absmiddle' src ='http://dict.hjenglish.com/images/btn_myword_add.gif' alt='\u6DFB\u52A0\u5230\u6211\u7684\u751F\u8BCD\u672C' width='16' height='16' /></a></span><br/><input type=\"hidden\" value=\"\u756A\u53F7\" id=\"hjd_amw_word_1\"/><input type=\"hidden\" value=\"\u3010\u540D\u8BCD\u3011 \r\n\u53F7\u7801\uFF0C\u53F7\u6570\uFF0C\u53F7\u5934\u3002\r\n\r\n\" id =\"hjd_wordcomment_1\"/><b>\u3010\u540D\u8BCD\u3011</b> <br/>\u53F7\u7801\uFF0C\u53F7\u6570\uFF0C\u53F7\u5934\u3002<br/><br/>",
// 	IfHasScb: "False",
// 	hjd_langs: "jc",
// 	WordId: "0",
// 	FromLang: "Jp",
// 	ToLang: "Cn"
// });
// HJ.fun.changeLanguage('jc');
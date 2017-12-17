


// Create a parent item and two children.
// var parent = chrome.contextMenus.create({
// 	"title": "queryWord",
// 	"onclick": queryWord
// });

chrome.contextMenus.create({
	title: "search %s in dictionary",
	contexts: ["selection"],
	onclick: itemClicked
});


function itemClicked(info, tab){
      // sendSearch(info.selectionText);
    var word = info.selectionText;
    if(!word) return;

    var url = "https://dict.hjenglish.com/services/simpleExplain/jp_simpleExplain.ashx?type=jc&w="+word;
    // chrome.tabs.create({"url": url});
    // alert("background.js "+ JSON.stringify(request))

    $.post(url,function(xhr){
        var neededHtml = xhr.substr(xhr.indexOf("{"),xhr.lastIndexOf("}") - xhr.indexOf("{") +1)
        

        var replaceArr = ["content","IfHasScb","hjd_langs","WordId","FromLang","ToLang"]
        for (var i = 0; i < replaceArr.length; i++) {
          neededHtml = neededHtml.replace(""+replaceArr[i], "\"" + replaceArr[i] + "\"")
        }



        var returnobj = {
          key:"queryresult",
          msg: {}
        }

        returnobj.msg['content'] = neededHtml;
        var userid = "me";

        // is the word exists?
        $.post("http://127.0.0.1:8000/polls/chrome_kquery/wordexists/"+userid+"?w="+word,function(xhr2){

          returnobj.msg['exists'] = xhr2.exists;
          
          sendToActiveTab(returnobj);
        });

        
    });


}


chrome.runtime.onMessage.addListener(

  function(request, sender, sendResponse) {

    if( request.key == "query" ) {
    	// var url = "https://dict.hjenglish.com/jp/jc/" + request.word;
 


    }



    if(key == "saveword"){
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
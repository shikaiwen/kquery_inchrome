
// shortcut :  https://developer.chrome.com/extensions/commands 

datatube = {}

var isBackground = function(){
	return window.location.href.indexOf("chrome-extension://") >= 0
}()


datatube.front = {}
datatube.front.request_openTab = function(url) {
	chrome.runtime.sendMessage({
		"key": "openTab",
		"url": url
	});
}

datatube.front.request_queryWord = function(word, callback) {
	datatube.front.request_queryWord_callback = callback;
	chrome.runtime.sendMessage({
		"key": "queryWordFontEnd",
		"val": word
	});
}

datatube.front.request_getTodayWordContent = function(callback){
	datatube.front.getTodayWordContent_callback = callback;
	chrome.runtime.sendMessage({
		"key": "getTodayWordContent",
	});
}



datatube.front.handle_getSelectedText = function(){
	return currentSelectedText;
}



//font end
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

			if(request.key == "getSelectedText"){
				chrome.runtime.sendMessage({
					"key": "getSelectedTextResult",
					"val": datatube.front.handle_getSelectedText()
				});
			}

			// query result 
			if(request.key == "queryWordFontEndResult"){
				datatube.front.request_queryWord_callback(request.val);
			}

			//获取到今日词汇
			if(request.key == "getTodayWordContent"){
				datatube.front.getTodayWordContent_callback(request.val);
			}

		}
	);







datatube.backend = {}
datatube.backend.handle_openTab = function(url){
	// chrome.tabs.create({"url": url});
	chrome.tabs.create({'url': "/options.html" } )
	// chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
}

datatube.backend.request_getSelectedText = function(callback){
	datatube.backend.request_getSelectedText_callback =  callback;
	var reqData = {} 
	reqData["key"] = "getSelectedText";
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		var activeTab = tabs[0];
		chrome.tabs.sendMessage(activeTab.id, reqData);
	});

}

// datatube.backend.request_showEmptyPanel = function(callback){
// 	datatube.backend.request_showEmptyPanel_callback =  callback;
// 	var reqData = {} 
// 	reqData["key"] = "showEmptyPanel";
// 	chrome.tabs.query({
// 		active: true,
// 		currentWindow: true
// 	}, function(tabs) {
// 		var activeTab = tabs[0];
// 		chrome.tabs.sendMessage(activeTab.id, reqData);
// 	});

// }


// backend
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if( request.key == "openTab" ) {
    	
 		datatube.backend.handle_openTab(request.url)
    }

    if(request.key == "getSelectedTextResult"){
    	datatube.backend.request_getSelectedText_callback(request.val);
    }


    if(request.key == "queryWordFontEnd"){
    	doQuery(request.val, function(resultobj){
			var reqData = {} 
			reqData["key"] = "queryWordFontEndResult";
			reqData["val"] = resultobj;
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				var activeTab = tabs[0];
				chrome.tabs.sendMessage(activeTab.id, reqData);
			});
    	});

    }


    if(request.key == "queryWordFontEnd"){
    	doQuery(request.val, function(resultobj){
			var reqData = {} 
			reqData["key"] = "queryWordFontEndResult";
			reqData["val"] = resultobj;
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				var activeTab = tabs[0];
				chrome.tabs.sendMessage(activeTab.id, reqData);
			});
    	});

    }

    if(request.key == "getTodayWordContent"){

    		var reqData = {}
    		reqData.key = "getTodayWordContent"
    		reqData.val = "背伸び";
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				var activeTab = tabs[0];
				chrome.tabs.sendMessage(activeTab.id, reqData);
			});

			return;

    	$.post("https://pythontest-191303.appspot.com/gettodayword",function(datas){


			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
				var activeTab = tabs[0];
				chrome.tabs.sendMessage(activeTab.id, reqData);
			});

    	});
    }
    
	// var info = request.msg;

	// chrome.tabs.query({
	// 	active: true,
	// 	currentWindow: true
	// }, function(tabs) {
	// 	var activeTab = tabs[0];
	// 	chrome.tabs.sendMessage(activeTab.id, data);
	// 	// chrome.runtime.sendMessage(data);
	// });



  }
);





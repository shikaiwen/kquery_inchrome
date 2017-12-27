
// shortcut :  https://developer.chrome.com/extensions/commands 

datatube = {}

var isBackground = function(){
	return window.location.href.indexOf("chrome-extension://") >= 0
}()


if (!isBackground) {
	
	datatube.front = {}
	datatube.front.request_openTab = function(url) {
		chrome.runtime.sendMessage({
			"key": "openTab",
			"url": url
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


		}
	);




}else{



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

	// backend
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {

	    if( request.key == "openTab" ) {
	    	
	 		datatube.backend.handle_openTab(request.url)
	    }

	    if(request.key == "getSelectedTextResult"){
	    	datatube.backend.request_getSelectedText_callback(request.val);
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



}







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





	//font end
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {



			// chrome.runtime.sendMessage({
			// 	"key": "openTab",
			// 	"url": url
			// });


		}
	);

}else{



	datatube.backend = {}
	datatube.backend.handle_openTab = function(url){
		// chrome.tabs.create({"url": url});
		chrome.tabs.create({'url': "/options.html" } )
		// chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
	}


	// backend
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {

	    if( request.key == "openTab" ) {
	    	
	 		datatube.backend.handle_openTab(request.url)
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






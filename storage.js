
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




start()

function start(items){
		checkTimestamp(function(){
			renderList();
		});

}


function renderList(){

	DB.get(null, function(items) {

		var sortedKeyArr = sortObject(items);
		doPageListRender(items,sortedKeyArr)


	});
}

function checkTimestamp(callback){

	DB.get(null, function(items) {
		var shouldDo = false;
		for(var key in items){

			if(!items[key].timestamp){
				items[key].timestamp = new Date().getTime();
				shouldDo = true;
			}
		}

		if(shouldDo){
			chrome.storage.sync.set(items, function(items) {
				callback()
			});
		}else{
			callback()
		}

	});
}


function sortObject(obj){
	var keyArr = Object.keys(obj);

	for(var v =0;v<keyArr.length;v++){

		var min = v;
		for (var i = v+1; i < keyArr.length ; i++) {

			if(obj[keyArr[i]].timestamp<obj[keyArr[min]].timestamp){
				min = i;
			}

		}	

		var temp = keyArr[v]
		keyArr[v] = keyArr[min]
		keyArr[min] = temp;
	}
	return keyArr;

}


function sortArray(arr){

	for(var v =0;v<arr.length;v++){

		var min = v;
		for (var i = v+1; i < arr.length ; i++) {

			if(arr[i]<arr[min]){
				min = i;
			}
		}	

		var temp = arr[v]
		arr[v] = arr[min]
		arr[min] = temp;
	}
	return arr;

}


function doPageListRender(items,sortedKeyArr){

	var sortedArr = new Array(items.length);

	var cnt = 0;

	for(var i = sortedKeyArr.length-1 ; i>0; i--){

		var wordKey = sortedKeyArr[i];
		var tr = $("#trTemplate").clone().attr("id","").show()
		$(tr).find(":nth-child(1)").html(++cnt)
		$(tr).find(":nth-child(2)").html(wordKey)
		$(tr).find(":nth-child(3)").html(items[wordKey]["jm"] +" "+ items[wordKey]["sd"]);

		var td4 = items[wordKey].fyf + "<br>" + "context:"+(items[wordKey].context ? items[wordKey].context: "");
		$(tr).find(":nth-child(4)").html(td4)

		$("#content tbody").append(tr)
		// $("<tr>").append($("<td>").html(wordKey))
		// .append($("<td>").html( items[wordKey]["roma"] +" "+ items[wordKey]["sd"]))
		// .append($("<td>").html(JSON.stringify(items[wordKey])))
		// .appendTo($("#content"))
	}

}

$(function(){
	$("#export").click(function(){
		

		DB.get(null,function(items){
			// console.log(items)

			// alert(toCsv(items))
			console.log(toCsv(items))
		});
	});
})



function toCsv(items){
	var all = []
	for(var key in items){
		var inner = []
		inner.push(key );

		inner.push(items[key]["roma"] +" "+ items[key]["sd"] +"\n"+items[key].fyf);

		all.push(inner)
	}

	var csv = Papa.unparse(all);
	return csv;
}
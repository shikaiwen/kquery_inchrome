

start()
var nowordkeylist = {"key.export":""}

function start(items){
		checkTimestamp(function(){
			renderList();
		});
}

function renderList(){

	DB.get(null, function(items) {

		$.map(Object.keys(items),function(val,key){

			if(val in nowordkeylist){
				delete items[val]
			}
	});

		// console.log(items)
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

	var datacnt = []

	for(var i = sortedKeyArr.length-1 ; i>=0; i--){

		var wordKey = sortedKeyArr[i];
		var arr = [i,
		wordKey,
		items[wordKey]["jm"] +" "+ items[wordKey]["sd"], 
		items[wordKey].fyf + "<br>" + "context:"+(items[wordKey].context ? items[wordKey].context: ""),
		new Date(items[wordKey].timestamp).toLocaleString()
		]
		datacnt.push(arr);
	}

    $('#content2').DataTable( {
	        data: datacnt,
	        columns: [
	            { title: "No" },
	            { title: "単語" },
	            { title: "発音" },
	            { title: "詳細説明" },
	            { title: "登録時間" }
	        ]
	    } );
	// for(var i = sortedKeyArr.length-1 ; i>=0; i--){

	// 	var wordKey = sortedKeyArr[i];
	// 	var tr = $("#trTemplate").clone().attr("id","").show()
	// 	$(tr).find(":nth-child(1)").html(++cnt)
	// 	$(tr).find(":nth-child(2)").html(wordKey)
	// 	$(tr).find(":nth-child(3)").html(items[wordKey]["jm"] +" "+ items[wordKey]["sd"]);

	// 	var td4 = items[wordKey].fyf + "<br>" + "context:"+(items[wordKey].context ? items[wordKey].context: "");
	// 	$(tr).find(":nth-child(4)").html(td4);
		
	// 	var d = new Date();
	// 	d.setTime(items[wordKey].timestamp)
	// 	$(tr).find(":nth-child(5)").html(d.toLocaleString());
	// 	$("#content tbody").append(tr)

	// }

}

function doPageListRender2(items,sortedKeyArr){

	var sortedArr = new Array(items.length);

	var cnt = 0;
	var datacnt = []


	var wordKey = "感染"
		var d = new Date();
		d.setTime(items[wordKey].timestamp)
		var timestr = d.toLocaleString()


	for(var i = 0 ; i < 20; i++){
		datacnt.push([i, wordKey,
		items[wordKey]["jm"] +" "+ items[wordKey]["sd"], 
		items[wordKey].fyf + "<br>" + "context:"+(items[wordKey].context ? items[wordKey].context: ""),
		(function(){var dt = new Date();dt.setTime(d.getTime()+ i*1000);return dt.toLocaleString()})()   ])
	}

    $('#content2').DataTable( {
	        data: datacnt,
	        columns: [
	            { title: "No" },
	            { title: "単語" },
	            { title: "発音" },
	            { title: "詳細説明" },
	            { title: "登録時間" }
	        ]
	    } );
}



$(function(){

	// $("#export").click(function(){
	// 	DB.get(null,function(items){
	// 		console.log(toCsv(items))
	// 	});
	// });

})



function toCsv(items){
	var all = []
	for(var key in items){
		var inner = [];
		inner.push(key);

		inner.push(items[key]["jm"] +" "+ items[key]["sd"] +"\n"+items[key].fyf);

		all.push(inner)
	}

	var csv = Papa.unparse(all);
	return csv;
}



 
$(document).ready(function() {

	// $("#panel > button.btn.btn-primary").click();


	$("#exportCsvBtn").click(function(){
		
		DB.get("key.export", function(exportHistoryList) {

			var checked =  $("#saveExpCheckbox").is(":checked");
			if(!(exportHistoryList["key.export"])){
				exportHistoryList = []
			}else{
				exportHistoryList = exportHistoryList["key.export"];
			}

			var otherv = new Date($("#startTimeInput").val().trim()).getTime();
			var expendtime = new Date($("#endTimeInput").val().trim()).getTime();

			if(!otherv){
				otherv = new Date().getTime() - 100 * (24 * 60 * 60 * 1000);
			}
			
			if(!expendtime){
				expendtime = new Date().getTime() - 999;
			}
			expendtime += 999;

			DB.get(null,function(items){

				var expArr = {}
				for(var key in items){
					if(key.indexOf("key.export") > -1) continue;
					otherv += 100;
					var wordstamp = items[key].timestamp
					if( wordstamp >= otherv && wordstamp<=expendtime){
						expArr[key] = items[key];
					}
				}

				console.log(toCsv(expArr));

				if(checked){
					var curtime = new Date().getTime();	
					var starttime = curtime;
					var exportInfo = {"dotime":curtime, "recordsCnt":Object.keys(expArr).length,"starttime":otherv, "expendtime":expendtime}
					exportHistoryList.push(exportInfo);

					DB.set({"key.export":exportHistoryList},function(){});
				}

			});

		});

	})

	$("#showExportBtn").click(function(){
		$('#myModal').modal('show');

		DB.get("key.export", function(items){

			var colDefine = {"dotime":"导出时间", "recordsCnt":"导出记录数","starttime":"单词开始时间", "expendtime":"单词结束时间"};

			var exphistoryList = []
			var order = ["dotime", "recordsCnt", "starttime","expendtime"];
			var dataSet = [];
			$.map(items["key.export"],function(data,index){
				var arr = []


				$.map(order,function(col){

					if(col == "dotime"){
						arr.push(new Date(data[col]).toLocaleString());
					}else if(col == "starttime"){
						arr.push(new Date(data[col]).toLocaleString());
					}else if(col == "expendtime"){
						arr.push(new Date(data[col]).toLocaleString());
					}else{
						arr.push(data[col]);
					}

				});
				dataSet.push(arr);
			});

			historyDataTable.clear().rows.add(dataSet).draw();

		});

	});


	historyDataTable = $('#example').DataTable({
    data: dataSet2,
    search:false,
    columns:    (function(){
    				var order = ["dotime", "recordsCnt", "starttime","expendtime"];
    				var colArr = [];
					$.map(order, function(col){
						colArr.push({title:col});
					});
					return colArr;
    	})()

	});

} );




var dataSet2 = [
    [ "Tiger Nixon", "System Architect", "Edinburgh", "5421", "2011/04/25", "$320,800" ],
    [ "Garrett Winters", "Accountant", "Tokyo", "8422", "2011/07/25", "$170,750" ],
    [ "Ashton Cox", "Junior Technical Author", "San Francisco", "1562", "2009/01/12", "$86,000" ],
    [ "Cedric Kelly", "Senior Javascript Developer", "Edinburgh", "6224", "2012/03/29", "$433,060" ],
    [ "Airi Satou", "Accountant", "Tokyo", "5407", "2008/11/28", "$162,700" ],
    [ "Brielle Williamson", "Integration Specialist", "New York", "4804", "2012/12/02", "$372,000" ],
    [ "Herrod Chandler", "Sales Assistant", "San Francisco", "9608", "2012/08/06", "$137,500" ],
    [ "Rhona Davidson", "Integration Specialist", "Tokyo", "6200", "2010/10/14", "$327,900" ],
    [ "Colleen Hurst", "Javascript Developer", "San Francisco", "2360", "2009/09/15", "$205,500" ],
    [ "Sonya Frost", "Software Engineer", "Edinburgh", "1667", "2008/12/13", "$103,600" ],
    [ "Jena Gaines", "Office Manager", "London", "3814", "2008/12/19", "$90,560" ],
    [ "Quinn Flynn", "Support Lead", "Edinburgh", "9497", "2013/03/03", "$342,000" ],
    [ "Charde Marshall", "Regional Director", "San Francisco", "6741", "2008/10/16", "$470,600" ]

];
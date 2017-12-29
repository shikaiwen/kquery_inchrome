



DB.get(null, function(items) {
	// console.log(items)
	initData(items)
	// alert(toCsv(items))
});


function initData(items){
	var cnt = 0;
	for(var key in items){
		var tr = $("#trTemplate").clone().attr("id","").show()
		$(tr).find(":nth-child(1)").html(++cnt)
		$(tr).find(":nth-child(2)").html(key)
		$(tr).find(":nth-child(3)").html(items[key]["roma"] +" "+ items[key]["sd"])
		$(tr).find(":nth-child(4)").html(items[key].fyf)

		$("#content tbody").append(tr)
		// $("<tr>").append($("<td>").html(key))
		// .append($("<td>").html( items[key]["roma"] +" "+ items[key]["sd"]))
		// .append($("<td>").html(JSON.stringify(items[key])))
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
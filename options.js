





DB.get(null,function(items){
	console.log(items)

	initData(items)
});

function initData(items){

	for(var key in items){
		$("<tr>").append($("<td>").html(key))
		.append($("<td>").html( items[key]["roma"] +" "+ items[key]["sd"]))
		.append($("<td>").html(JSON.stringify(items[key])))
		.appendTo($("#content"))
	}



}
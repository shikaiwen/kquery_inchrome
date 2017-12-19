/**
    @author kevin
    @name フームパラメータのツール
 **/

(function($){

    var methods = {
        /**
         * フームダータをjsonに変更させます, もし複数のelementがあれば、arrayの形になります
         * 　
         * 使い方:　
         * <div id="container">
         * 		<input type="text" name="username" value="kevin"/>
         *  	<input type="text" name="hobby" value="sports"/>
         * </div>
         *
         * var info = $("#container").formHelper("getJson")
         * info is {"username":"kevin","hobby":"sports"}　
         *
         */
        getJson : function(){

            var data = {};
            $(this).find(":text,:checkbox,:radio,select,textarea").filter(":enabled").each(function (index) {

                var name = $(this).attr("name");
                var value = $(this).val();

                if(!name)return;

                // checkbox, radio only get the checked item
                if($(this)[0].type in {"radio":"","checkbox":""} && !$(this).is(":checked")) {
                    return;
                }

                if( data[name] ){

                    if( typeof(data[name]) === "string"){
                        var valueArr = [];
                        valueArr.push(data[name]); //previous value
                        valueArr.push(value);          // current value
                        data[name] = valueArr;
                    }else {
                        data[name].push(value);
                    }
                }else {
                    data[name] = value;
                }


            });

            return data;

        },
        deseriByName:function(json){

            for(var name in json){
                var elt = $(this).find("name=['"+ name +"']");
                if($(elt).attr("type") == "checkbox" || $(elt).attr("type") == "radio"){
                    $(elt).attr("checked",true);
                }else{
                    $(elt).val(json.name);
                }
            }

        }

    }
    
    $.fn.formHelper = function(method){
        if (methods[method]) {
            return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this,arguments);
        }else{
            console.log(method + ' does not exist');
        }

    }
})($);
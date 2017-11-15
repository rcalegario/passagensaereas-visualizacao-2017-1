destino = ["REcife","Paulista","olinda"]

// var list = document.getElementById("sel-origem"); 
// for (var i = 0; i < destino.length; i++){                
//     var opt = destino[i];  
//     var op = document.createElement("option");
//     var link = document.createElement("a");             
//     var text = document.createTextNode(opt);
//     link.appendChild(text);
//     link.href = "#";
//     op.appendChild(link);
//     list.appendChild(op);
// }

function selectUpdate(id,list){
    var select = document.getElementById(id); 
    selectAddOpitions(select,list)
}

function selectAddOpitions(select, list){
    list.forEach(element => {
        var text = document.createTextNode(element);
        
        var link = document.createElement("a");
        link.appendChild(text);
        link.href = "#";

        var op = document.createElement("option");
        op.appendChild(link);

        select.appendChild(op);
    });
}

selectUpdate("sel-origem",destino)
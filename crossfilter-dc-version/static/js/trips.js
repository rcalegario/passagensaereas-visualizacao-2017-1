function selectUpdate(id,list){
    var select = document.getElementById(id); 
    while(select.hasChildNodes()){
        select.removeChild(select.firstChild);
    }
    selectAddOpitions(id,select,list)
}

function selectAddOpitions(id, select, list){
    var text = document.createTextNode("Selecione uma cidade");
    var op = document.createElement("option");
    op.value = -1;
    op.appendChild(text)
    select.appendChild(op);
    
    var i = 0;
    list.forEach(element => {
        var text = document.createTextNode(element);
        var link = document.createElement("a");
        link.appendChild(text);
        link.href = "javascript:choseOrigin(\'" + id + "\')";

        var op = document.createElement("option");
        op.value = i++;
        op.appendChild(link);

        select.appendChild(op);
    });
}

function convertData(d) {
    d['pre_travel'] = +d['pre_travel'];
    d['duration'] = +d['duration'];
    d['post_day'] = +d['post_day'];
    d['start_day'] = +d['start_day'];
    d['min_price'] = +d['min_price'];
    d['max_price'] = +d['max_price'];
    d['mean_price'] = +d['mean_price'];
    d['median_price'] = +d['median_price'];
    d['n'] = +d['n'];
    return d;
}

d3.csv('../data/sao_paulo.csv', convertData, initializeData);

var trips,
    dimensions = {},
    groups = {},
    listOrigin = [],
    listDestination = [];

function initializeData(data) {
    console.log("inicializando dados")

    trips = crossfilter(data);

    dimensions.origin = trips.dimension(d => { return d["origin"] });
    dimensions.destination = trips.dimension(d => { return d["destination"] });

    groups.origin = dimensions.origin.group().reduce(reduceAdd,reduceRemove,reduceInit)
    groups.destination = dimensions.destination.group().reduce(reduceAdd,reduceRemove,reduceInit)

    createListOrigin();
    createListDestination();
}

function createListOrigin() {
    listOrigin = []
    groups.origin.all().forEach(element => {
            if(element.value.count > 0) {
                listOrigin.push(element.key);
            }
    });
        selectUpdate("sel-origem", listOrigin);
}

function createListDestination() {
    listDestination = []
    groups.destination.all().forEach(element => {
            if(element.value.count > 0) {
                listDestination.push(element.key);
            }
    });
    console.log(listDestination.length)
    selectUpdate("sel-destino", listDestination);
}

function choseOrigin(id) {
    console.log(document.createTextNode(id))
}

function reduceAdd(p, v) {
    p.count++;
    p.sum += v['median_price'];
    p.avg = (p.count > 0) ? p.sum/p.count : 0;
    return p;
}

function reduceRemove(p, v) {
    p.count--;
    p.sum -= v['median_price'];
    p.avg = (p.count > 0) ? p.sum/p.count : 0;
    return p;
}

function reduceInit() {
    return {
        count: 0,
        sum: 0,
        avg: 0
    }
}

$("#sel-origem").change(function(){
    var originId = $(this).val();
        
    if(originId < 0) {
        dimensions.origin.filterAll();
    } else {
        var originName = listOrigin[originId];
        dimensions.origin.filter(originName);
    }

    createListDestination();
});

$("#sel-destino").change(function(){
    var destinationId = $(this).val();
        
    if(destinationId < 0) {
        dimensions.destination.filterAll();
    } else {
        var destinationName = listDestination[destinationId];
        dimensions.destination.filter(destinationName);
    }

    createListOrigin();
});

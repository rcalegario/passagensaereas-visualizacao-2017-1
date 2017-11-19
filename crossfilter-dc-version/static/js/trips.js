var originSelected = "",
    destinationSelected = "";

// num = {};
// num.maxPrice = dc.numberDisplay("#valor-maximo");
// num.minPrice = dc.numberDisplay("#valor-minimo");
// num.medPrice = dc.numberDisplay("#valor-medio");
var chart = {}
chart.postDay = barChartInicializer("#dia-compra");
chart.postMonth = barChartInicializer("#mes-compra");
chart.postWday = barChartInicializer("#wday-compra");
chart.startDay = barChartInicializer("#dia-viagem");
chart.startMonth = barChartInicializer("#mes-viagem");
chart.startWday = barChartInicializer("#wday-viagem");
chart.duration = barChartInicializer("#travel-duration");
chart.pre = barChartInicializer("#pre-travel");

function selectUpdate(id, list, first){
    var select = document.getElementById(id); 
    while(select.hasChildNodes()){
        select.removeChild(select.firstChild);
    }
    selectAddOpitions(id,select,list,first)
}

function optionCreator(opText, id){
    var text = document.createTextNode(opText);
    
    var op = document.createElement("option");
    op.value = id;

    op.appendChild(text);

    return op;
}

function selectAddOpitions(id, select, list, first){
    
    var text;
    if(first.length > 0) {
        var op = optionCreator(first, -1)
        select.appendChild(op);
    } 

    var op = optionCreator("Selecione uma cidade", -1)
    select.appendChild(op);
    
    var i = 0;
    list.forEach(element => {
        var op = optionCreator(element,i++);
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
    listDestination = [],
    all;

function initializeData(data) {
    console.log("inicializando dados")

    var reducer = reductio()
        .count(true)
        .sum(function(d) { return d['median_price']; })
        .avg(true);

    // var reducer2 = reductio()
    //     .max(function(d) { return d['median_price']; })
    //     .min(function(d) { return d['median_price']; })
    //     .median(function(d) { return d['median_price']; });

    trips = crossfilter(data);
    // all = trips.groupAll();
    // reducer2(all);
    
    dimensions.origin = trips.dimension(d => { return d["origin"] });
    dimensions.destination = trips.dimension(d => { return d["destination"] });
    dimensions.postDay = trips.dimension(d => { return d["post_day"] });
    dimensions.startDay = trips.dimension(d => { return d["start_day"] });
    dimensions.postMonth = trips.dimension(d => { return d["post_month"] });
    dimensions.startMonth = trips.dimension(d => { return d["start_month"] });
    dimensions.postWday = trips.dimension(d => { return d["post_wday"] });
    dimensions.startWday = trips.dimension(d => { return d["start_wday"] });
    dimensions.pre = trips.dimension(d => { return d["pre_travel"] });
    dimensions.duration = trips.dimension(d => { return d["duration"] });
    
    var groupsKeys = Object.keys(dimensions);
    groupsKeys.forEach(element => {
        groups[element] = dimensions[element]
            .group();
            // .reduce(reduceAdd,reduceRemove,reduceInit);
        reducer(groups[element]);
    })

    // num.maxPrice
    //     .formatNumber(d3.format("d"))
    //     .valueAccessor(function(d){ return d.max; })
    //     .group(all);

    // num.minPrice
    //     .formatNumber(d3.format("d"))
    //     .valueAccessor(function(d){return d.min; })
    //     .group(all);

    // num.medPrice
    //     .formatNumber(d3.format("d"))
    //     .valueAccessor(function(d){return d.median; })
    //     .group(all);

    var chartsKeys = Object.keys(chart);
    chartsKeys.forEach(element => {

        chart[element]
            .dimension(dimensions[element])
        if(element == 'pre' || element == 'duration') {
            newGroup = remove_empty_bins(groups[element]);
            
            chart[element]
                .group(newGroup);
            chart[element].xAxis().ticks(5);
            // chart[element].yAxis().ticks(5);
        } else {
            chart[element]
                .group(groups[element]);
        }
    })

    createListOrigin();
    createListDestination();
}

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value.count != 0; 
            });
        }
    };
}

function barChartInicializer(id){
    return dc.barChart(id)
        .width(550)
        .height(400)
        .valueAccessor(dataAcessor)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .elasticY(true);
}

function dataAcessor(d) {
    return (d.value.count > 0) ? d.value.sum/d.value.count : 0;
}

function createListOrigin() {
    listOrigin = []
    groups.origin.all().forEach(element => {
            if(element.value.count > 0) {
                listOrigin.push(element.key);
            }
    });
    selectUpdate("sel-origem", listOrigin, originSelected);
}

function createListDestination() {
    listDestination = []
    groups.destination.all().forEach(element => {
            if(element.value.count > 0) {
                listDestination.push(element.key);
            }
    });
    console.log(listDestination.length)
    selectUpdate("sel-destino", listDestination, destinationSelected);
}

function choseOrigin(id) {
    console.log(document.createTextNode(id))
}

function reduceAdd(p, v) {
    p.count++;
    p.sum += v['median_price'];
    // p.avg = (p.count > 0) ? p.sum/p.count : 0;
    return p;
}

function reduceRemove(p, v) {
    p.count--;
    p.sum -= v['median_price'];
    // p.avg = (p.count > 0) ? p.sum/p.count : 0;
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
        
        filterAllDimensions();
    
    dimensions.destination.filterAll()
    if(originId < 0) {
        originSelected = "";
        d3.selectAll("svg").remove();
    } else {
        originSelected = listOrigin[originId];
        dimensions.origin.filter(originSelected);
        if(destinationSelected.length > 0) dc.renderAll();
    }
    createListDestination();
});

$("#sel-destino").change(function(){
    var destinationId = $(this).val();
    
    
    filterAllDimensions();
    
    dimensions.origin.filterAll()
    if(destinationId < 0) {
        destinationSelected = "";
        d3.selectAll("svg").remove();
    } else {
        destinationSelected = listDestination[destinationId];
        dimensions.destination.filter(destinationSelected);
        if(originSelected.length > 0) dc.renderAll();
    }
    createListOrigin();
});

function filterAllDimensions() {
    if(destinationSelected.length > 0 && originSelected.length > 0){
        var keys = Object.keys(dimensions);
        keys.forEach(element => {
            if(element != "origin" && element != "destination"){
                dimensions[element].filterAll()
            }
        })
    }
}
// 
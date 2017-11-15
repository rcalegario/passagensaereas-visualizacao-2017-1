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

d3.csv('../data/sao_paulo.csv', convertData, makeCharts);

function makeCharts(data) {
    
}


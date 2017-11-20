var map = L.map('map').setView([-15.7942287, -47.8821658], 10);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(map);

var trips,
    originDim,
    destinationDim,
    originGrp,
    destinationGrp;

d3.csv('../data/sao_paulo.csv',convertData, function(csv){

    trips = crossfilter(csv);
    
    originDim = trips.dimension(d => { return d.origin });
    originGrp = originDim.group();
    destinationDim = trips.dimension(d => { return d.destination });
    destinationGrp = destinationDim.group();


    d3.json('../data/coord.json', function(err,data){
        if(err) {
            console.log(err);
        } else {
            markerInit(data)
        }
    });
});

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

var cities = {};
var markers = [];

function markerInit(data) {
    var i = 0;
    
    data.forEach(element => {
        var coord = [element.latitude,element.longitude]
        cities[element.city] = coord;
        var icon = iconCreator('init');
        var marker = L.marker(coord, {
            icon: icon,
            draggable: true,
            city: element.city,
            id: i++
        })
        map.addLayer(marker);
        marker.bindPopup(element.city)
            .on('click', chooseOrigin);
            
        markers.push(marker);
    });
}

var fistClick = null,
    secondClick = null;


function chooseOrigin(e) {
    console.log(e)
    fistClick = e.target;
    var icon = iconCreator('origin');
    e.target.setIcon(icon);
    e.target.on('click', restartChoise)
        .off('click', chooseOrigin);

    var cityOrigin = e.target.options.city;
    originDim.filter(cityOrigin);
    var destinations = destinationGrp.all();
    var destinationOptions = {};
    destinations.forEach(destiny => {
        if(destiny.value > 0) {
            destinationOptions[destiny.key] =  true;
        }
    });

    markers.forEach(marker => {
        if(marker != e.target) {
            if(destinationOptions[marker.options.city]){
                var icon = iconCreator('destinyOption');
                marker.setIcon(icon);
                marker.on('click', chosseDestination)
                    .off('click', chooseOrigin);
            } else {
                var icon = iconCreator('notOption');
                marker.setIcon(icon);
                marker.on('click', noDestination)
                    .off('click', chooseOrigin);
            }
        }
    });
}

function restartChoise(e) {
    console.log(e)
    fistClick = null;
    originDim.filterAll();
    destinationDim.filterAll();
    var icon = iconCreator('init');
    markers.forEach(marker => {
        marker.setIcon(icon);
        marker.on('click', chooseOrigin)
            .off('click', chosseDestination)
            .off('click', noDestination);
    });
}

function chosseDestination(e) {
    console.log(e)
    secondClick = e.target;
    var icon = iconCreator('destination');
    e.target.setIcon(icon);
    e.target.on('click', resetDestination)
        .off('click', chosseDestination);
}

function resetDestination(e) {
    console.log(e)
    secondClick = null;
    var icon = iconCreator('destinyOption');
    e.target.setIcon(icon);
    e.target.on('click', chosseDestination)
        .off('click', resetDestination);
}

function noDestination(e) {
    alert('Esse não é um destino válido');
}

function iconCreator(type) {
    var markerShape = {
        noclicked: 'circle-dot',
        click: 'doughnut'
    };
    
    var markerColor = {
        init: 'red',
        origin: 'blue',
        destiny: 'green',
        nodestiny: 'black',
        destination: 'yellow'
    }

    var iconOptions = {
        borderWidth: 5,
    }
    switch (type) {
        case 'init':
            iconOptions.iconShape = markerShape.noclicked;
            iconOptions.borderColor = markerColor.init;
            break;
        case 'origin':
            iconOptions.iconShape = markerShape.click;
            iconOptions.borderColor = markerColor.origin;
            break;
        case 'destination':
            iconOptions.iconShape = markerShape.click;
            iconOptions.borderColor = markerColor.destination;
            break;
        case 'destinyOption':
            iconOptions.iconShape = markerShape.noclicked;
            iconOptions.borderColor = markerColor.destiny;
            break;
        case 'notOption':
            iconOptions.iconShape = markerShape.noclicked;
            iconOptions.borderColor = markerColor.nodestiny;
            break;
        default:
            break;
    }
    return L.BeautifyIcon.icon(iconOptions);
}




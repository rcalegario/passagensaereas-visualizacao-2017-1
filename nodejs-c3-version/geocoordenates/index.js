var request = require('request');
var fs = require('fs');
var properties = require('properties-reader')('google-geo-coord-api.properties');

var googleMapsClient = require('@google/maps').createClient({
	key: properties.get('google.api.maps.key')
  });

var cities = fs.readFileSync('cities.txt', 'utf-8').split('\n');

console.log('[');

cities.forEach( city => {
	if(city != '') {
		googleMapsClient.geocode({ address: city }, function(err, resp) {
			if (!err) {
				var cityCoord = resp.json.results[0].geometry.location;
				info = {
					'city' : city,
					'logitude' : cityCoord.lng,
					'latitude' : cityCoord.lat
				}
				console.log(JSON.stringify(info) + ',');
			}
		});
	}
});

console.log(']');
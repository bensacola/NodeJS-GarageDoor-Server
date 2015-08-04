var express = require('express');
var config = require('./config');
var path = require('path');
var gpio = require('pi-gpio');
var async = require('async');
var app =  express();

var listenPort = config.PORT || 4351;

var GARAGE_STATE = { 
<<<<<<< HEAD
	UNKNOWN:0, 
	CLOSED:1,
	OPEN:2,
	TRANSISTION: 4
=======
	UNKNOWN:0,
	CLOSED:1,
	OPEN:2,
	TRANSISTION: 4 
>>>>>>> fc0182abe8039796760f0426fab4e91585eacda8
};
var garageState = GARAGE_STATE.CLOSED;

/**************************************************/

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(request, response) {
	response.redirect('/home.html');
});

app.get("/ping", function(request, response) {
	response.json('pong');
});

app.get('/time', function(request, response) {
	response.send(new Date());
});

app.post('/open',function(request, response) {
  console.log('received open');
	triggerGarage(reqeust,response,GARAGE_STATE.OPEN);
});

app.post('/close', function(request, response) {
  console.log('received close');
	triggerGarage(reqeust,response, GARAGE_STATE.CLOSED);
});

app.get('/state', function(request, response) {
	  response.json(getGarageState());
});

function triggerGarage(request, response, state) {
	garageState = GARAGE_STATE.TRANSITION;
	async.series([
		function(callback) {
			// Open pin for output
			gpio.open(config.LEFT_GARAGE_PIN, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			gpio.write(config.LEFT_GARAGE_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.LEFT_GARAGE_PIN, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				gpio.close(config.LEFT_GARAGE_PIN);
				garageState = state;
				
				// Return json
				res.json(getGarageState());
				
			}, config.RELAY_TIMEOUT);
		}
	]);
};

function getGarageState() {
	if(garageState == GARAGE_STATE.CLOSED) {
		return "closed";
	} 
	else if(garageState == GARAGE_STATE.OPENED ){
		return "open";
	} 
	else if(garageState == GARAGE_STATE.TRANSITION) {
		return "transitioning";
	}
	return "unknown";
};

function delayPinWrite(pin, value, callback) {
	setTimeout(function() {
		gpio.write(pin, value, callback);
	}, config.RELAY_TIMEOUT);
}

app.get('/config', function(request, response) {
	var r = 'config { ';
	for(var i in config) {
		r += i + ':' + config[i] +'; ';
	}
	r+= ' }';
	response.send(r);
});

app.get('/*', function(request, response) {
	response.redirect('/');
});

var server = app.listen(listenPort, function() {
  var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
});


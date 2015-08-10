var express = require('express');
var config = require('./config');
var path = require('path');
var gpio = require('pi-gpio');
var async = require('async');
var app =  express();
var read = require("read");
var listenPort = config.PORT || 4351;

var STATE = {  
	CLOSED:0,
	OPEN:1,
};

var garage = {
  openSensor: 0,
  closedSensor: 0,
  currentState: STATE.UNKNOWN
};

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
	triggerGarage(reqeust,response,STATE.OPEN);
});

app.post('/close', function(request, response) {
  console.log('received close');
	triggerGarage(reqeust,response, STATE.CLOSED);
});

app.get('/state/open', function(request, response) {
	  getGarageState(config.INPUT_OPEN,response);
});

app.get('/state/closed', function(request, response) {
	  getGarageState(config.INPUT_CLOSED,response);
});

function triggerGarage(request, response, state) {
	garageState = STATE.TRANSITION;
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

function getGarageState(pin, response) {
	readGarageState(pin, function(err, value) {
		if(value == STATE.CLOSED) {
			console.log(err || "closed");		
			response.send(err || "closed");
		} 
		else if(value == STATE.OPENED ){
			console.log(err || "open");
			response.send(err || "open");
		} 
	});
};

function readGarageState(pin,callback) {
  gpio.read(pin, callback);
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

gpio.open(config.INPUT_OPEN, {}, function() {
	gpio.setDirection(config.INPUT_OPEN, "input");
});
gpio.open(config.INPUT_CLOSED, {}, function() {
	gpio.setDirection(config.INPUT_CLOSED, "input");
});
gpio.open(config.12, {}, function() {
	gpio.setDirection(12,"output", function() {
	  gpio.close(12);
	});
});

var server = app.listen(listenPort, function() {
  var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
	readCredentials();
});

function readCredentials() {
	read({prompt: 'Email Address: '}, function(err, email) {
		process.env.EMAIL_USER = email;
		read({prompt: 'Password: ', silent: true}, function(err,password) {
		  process.env.EMAIL_PASS = password;
		  console.log(err);
		});
	});	
};


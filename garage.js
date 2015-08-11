var express = require('express');
var config = require('./config');
var path = require('path');
var gpio = require('rpi-gpio');
var async = require('async');
var email = require('email');
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

gpio.on('change', function(channel, value) {
    console.log('Channel ' + channel + ' value is now ' + value);
    var email = {};
    email.to = "freestylsurfr@cox.net";
    email.subject = "RPI2 GPIO";
    email.body = "GPIO PIN " + channel + " is now " + value;
    sendEmail(email)
});

function sendEmail(options) {
console.log('sending email');
	var emailServer  = email.server.connect({
		user: process.env.EMAIL_USER, 
		password: process.env.EMAIL_PASS, 
		host:"smtp.cox.net"
		,port:465
		,ssl:true
		//,port:587
		//,tls:true
	});
 var message = {
		text:    options.body, 
		from:    "benronan@cox.net", 
		to:      options.to,
		subject: options.subject
 }
 emailServer.send(message, function(err, message) {
	 if(err) {
		 console.log(err); 
	 }
	 else {
		 console.log('sent email');
	 }
	 });

};


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
		gpio.setup(config.INPUT_CLOSED, gpio.DIR_IN, function() {
		gpio.read(config.INPUT_CLOSED,  function(err, value) {
			if(value == false) {
				console.log(err || "closed");		
				response.json(err || "closed");
			} 
			else if(value == true ){
				console.log(err || "open");
				response.json(err || "open");
			} 
			else {
				console.log(err || "unknown");
				response.json(err || "unknown");
			}
		});
	});
});

app.get('/state/closed', function(request, response) {
	gpio.setup(config.INPUT_OPEN, gpio.DIR_IN, function() {
		gpio.read(config.INPUT_OPEN,  function(err, value) {
			if(value == false) {
				console.log(err || "closed");		
				response.json(err || "closed");
			} 
			else if(value == true ){
				console.log(err || "open");
				response.json(err || "open");
			} 
			else {
				console.log(err || "unknown");
				response.json(err || "unknown");
			}
		});
	});
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

function getGarageState(pin, response, callback) {
	readGarageState(pin, function(err, value) {
		if(value == false) {
			console.log(err || "closed");		
			response.send(err || "closed");
		} 
		else if(value == true ){
			console.log(err || "open");
			response.send(err || "open");
		} 
		else {
			console.log(err || "unknown");
			response.send(err || "unknown");
		}
	});
};


function readGarageState(pin,callback) {
	gpio.setup(pin, gpio.DIR_IN, function() {
		gpio.read(pin,  callback);
	});
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

function readCredentials() {
	read({prompt: 'Email Address: '}, function(err, email) {
		process.env.EMAIL_USER = email;
		read({prompt: 'Password: ', silent: true}, function(err,password) {
		  process.env.EMAIL_PASS = password;
		  console.log(err);
		});
	});	
};

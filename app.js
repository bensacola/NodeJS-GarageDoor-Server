//node modules
var express = require('express');
var app =  express();
var path = require('path');
var async = require('async');
var read = require("read");

//user defined includes
var config = require('./config');
var GPIO = require('./gpio');
var gpio = new GPIO();

//global variables 
var listenPort = config.PORT || 4351;

app.use('/', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.redirect('/home.html');
});

app.get("/ping", function(req, res) {
	res.json('pong');
});

app.get('/time', function(req, res) {
	res.send(new Date());
});

app.get('/state/open', function(req, res) {
		gpio.read(config.INPUT_OPEN, function(err, value)  {
		  res.send(err || value);
		});
});

app.get('/state/closed', function(req, res) {
		gpio.read(config.INPUT_CLOSED, function(err, value)  {
		  res.send(err || value);
		});
});

app.get('/state/both', function(req, res) {
  getGarageState(function(err, value) {
	  if(err) {
		  res.send("Error: " + err);
		}
		else {
		  res.send("Garage State: " + value);
		}
	});
});

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
  readCredentials();
});

function readCredentials() {
	read({prompt: 'Email Address: '}, function(err, email) {
		process.env.EMAIL_USER = email;
		if(err) {
			console.log("Error reading email user: "  + err);
			return;
		}
		read({prompt: 'Password: ', silent: true}, function(err,password) {
		  process.env.EMAIL_PASS = password;
			if(err)console.log("Error reading email password: "  + err);
		});
	});	
};


function getGarageState(callback) {
	var error, input_closed, input_open, garage_state = "UNKNOWN";
	
	var determineState = function() {
		console.log('determine state');
		  if(input_closed && !input_open) {
			  garage_state = "CLOSED"
			}
			else if(!input_closed && input_open) {
			  garage_state = "OPEN"
			}
			else {
			  garage_state = "TRANSITIONING"
		  }
			callback(error,garage_state);
		};
	var readOpen = function() {
		console.log('read open');
		gpio.read(config.INPUT_OPEN, function(err, value)  {
			console.log('value is ' + value);
			input_open = value;
			error = err;
			determineState()
		});
	};
	var readClosed = function() {
	console.log('read closed');
		gpio.read(config.INPUT_CLOSED, function(err, value)  {
			input_closed = value;
			error = error || err;
			readOpen();
		});
	};
};

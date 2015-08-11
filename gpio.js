"use strict";

var gpio = require('rpi-gpio');
function GPIO() {
	
	//read method
	this.read = function(pin, onReadCallback) {
	 gpio.setup(pin, gpio.DIR_IN, function(err) {
			if(err) {
				var errorMessage = "Error setting up gpio pin (" + pin +"). " + err);
				console.log(errorMessage);
				onReadCallback(errorMessage);
				return;
			}
			gpio.read(pin, onReadCallback);
		});
	}
	
	//write method
	this.write = function(pin, value, onWriteCallback) {
	 gpio.setup(pin, gpio.DIR_OUT, function(err) {
			if(err) {
				var errorMessage = "Error setting up gpio pin (" + pin +"). " + err);
				console.log(errorMessage);
				onWriteCallback(errorMessage);
				return;
			}
			gpio.write(pin, value, onWriteCallback);
		});
	}
	
	//delayed write method
	this.delayWrite = function(pin, value, delay, onWriteCallback) {
		setTimeout(function() {
			this.write(pin, value, onWriteCallback);
		}, delay);
	}


};
module.exports = GPIO;
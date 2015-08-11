"use strict";

var gpio = require('rpi-gpio');
function GPIO() {
	this.pins = [];
	//read method
	this.read = function(pin, onReadCallback) {
	 if(this.pins.indexOf(pin) < 0) {
			gpio.setup(pin, gpio.DIR_IN, function(err) {
				if(err) {
					var errorMessage = "Error setting up gpio pin (" + pin +"). " + err;
					console.log(errorMessage);
					onReadCallback(errorMessage);
					return;
				}
				this.pins.push(pin);
				gpio.read(pin, onReadCallback);
			});
	 }
	 else {
			gpio.read(pin, onReadCallback);
	 }
	}
	
	//write method
	this.write = function(pin, value, onWriteCallback) {
	 if(this.pins.indexOf(pin) < 0) {
		 gpio.setup(pin, gpio.DIR_OUT, function(err) {
				if(err) {
					var errorMessage = "Error setting up gpio pin (" + pin +"). " + err;
					console.log(errorMessage);
					onWriteCallback(errorMessage);
					return;
				}
				this.pins.push(pin);
				gpio.write(pin, value, onWriteCallback);
			});
	 }
	 else {
				gpio.write(pin, value, onWriteCallback);
	 }
	}
	
	//delayed write method
	this.delayWrite = function(pin, value, delay, onWriteCallback) {
		setTimeout(function() {
			this.write(pin, value, onWriteCallback);
		}, delay);
	}


};
module.exports = GPIO;

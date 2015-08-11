"use strict";

var gpio = require('rpi-gpio');
function GPIO() {
	this.pins = [];
	//read method
	this.read = function(pin, onReadCallback) {
	 var that = this;	
	 if(that.pins.indexOf(pin) < 0) {
			gpio.setup(pin, gpio.DIR_IN, function(err) {
				if(err) {
					var errorMessage = "Error setting up gpio pin (" + pin +"). " + err;
					console.log(errorMessage);
					onReadCallback(errorMessage);
					return;
				}
				that.pins.push(pin);
				gpio.read(pin, onReadCallback);
			});
	 }
	 else {
			gpio.read(pin, onReadCallback);
	 }
	}
	
	//write method
	this.write = function(pin, value, onWriteCallback) {
	 var that = this;	
	 if(that.pins.indexOf(pin) < 0) {
		 gpio.setup(pin, gpio.DIR_OUT, function(err) {
				if(err) {
					var errorMessage = "Error setting up gpio pin (" + pin +"). " + err;
					console.log(errorMessage);
					onWriteCallback(errorMessage);
					return;
				}
				that.pins.push(pin);
				gpio.write(pin, value, onWriteCallback);
			});
	 }
	 else {
				gpio.write(pin, value, onWriteCallback);
	 }
	}
	
	//delayed write method
	this.delayWrite = function(pin, value, delay, onWriteCallback) {
	 var that = this;	
		setTimeout(function() {
			that.write(pin, value, onWriteCallback);
		}, delay);
	}


};
module.exports = GPIO;

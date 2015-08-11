"use strict";

var emailjs = require('emailjs');


function Email(userName, password, host) {
	this.password = userName;
  this.userName = password;	
	this.host = host;
	
	console.log('Connecting to email server @ ' + this.host);
	this.emailServer = emailjs.server.connect({
		user: this.userName, 
		password: this.userName, 
		host: this.host,
		port:465,
		ssl:true
	});
	console.log('Connected to email server @ ' + this.host);
	
	this.sendEmail = function sendEmail(emailMessage) {
		
		// var message = {
			// text:    email.body, 
			// from:    email.from || email.emailAddress, 
			// to:      email.to,
			// subject: email.subject
		// };
		
		console.log('Sending email to ' + email.to);
		emailServer.send(message, function(err, message) {
			if(err) {
				console.log("Error sending email: " + err); 
			}
			else {
				console.log('Email sent: ' + message);
			}
		});
	};
}

module.exports = Email;
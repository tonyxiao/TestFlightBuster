var tfCookie = '93d98b24ff70c226de78a6809e3b0f05';
var tfAppId = 1267682; // Marco Polo Dev

var express = require('express');
var request = require('request').defaults({
	jar: true,
	json: true,
	headers: {
		'Cookie': 'tfapp=' + tfCookie + ';'
	}
});
var app = express();

app.get('/latest', function(req, response) {
	// First find ID of the latest build
	request.get('https://testflightapp.com/m/api/apps/' + tfAppId, function(err, res, body) {
		var buildID = body['list'][0]['id'];
		// console.log(res.statusCode);
		// console.log(body);
		// Then retrieve installation URL of the latest build
		request.get('https://testflightapp.com/m/api/apps/' + tfAppId + '/' + buildID, function(err, res, body) {
			console.log('will redirect to ' + body['install_url']);
			response.redirect(body['install_url']);
		});
	});
});

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

require('newrelic');
var tfCookie = '93d98b24ff70c226de78a6809e3b0f05';
var tfAppId = 1267682; // Marco Polo Dev
var pageSize = 100;

var express = require('express');
var request = require('request').defaults({
	jar: true,
	json: true,
	headers: {
		'Cookie': 'tfapp=' + tfCookie + ';'
	}
});
var app = express();

function listBuildsForApp(offset, limit, callback) {
	request.get({
		url: 'https://testflightapp.com/m/api/apps/' + tfAppId,
		qs: {
			seek: offset,
			pagesize: limit
		}
	}, function(err, res, body) {
		if (err) {
			callback(null);
		} else {
			callback(body['list']);
		}
	});
}

function findBuildByBuildBumber(buildNumber, offset, callback) {
	var pattern = new RegExp("^.*?\\(" + buildNumber + "\\)$");
	var limit = 100;
	listBuildsForApp(offset, limit, function(buildList) {
		// Empty build list means that we've exhausted all builds
		if (!buildList || buildList.length == 0) {
			callback(null);
			return;
		}

		// Iterate through each build and see if we find the one matching pattern
		for (var i = 0; i < buildList.length; i++) {
			var build = buildList[i];
			// console.log(build['bundle_version'], pattern);
			if (build['bundle_version'].match(pattern)) {
				callback(build);
				return;
			}

		}

		// Recursive callback
		findBuildByBuildBumber(buildNumber, offset + limit, callback);
	});
}

function redirectToBuild(response, build) {
	request.get('https://testflightapp.com/m/api/apps/' + tfAppId + '/' + build['id'], function(err, res, body) {
		console.log(body);
		console.log('will redirect to ' + build['bundle_version'] + ' url: ' + body['install_url']);
		response.redirect(body['install_url']);
	});
}

app.get('/latest', function(req, response) {
	// First find ID of the latest build
	listBuildsForApp(0, 1, function(buildList) {
		if (!buildList || buildList.length == 0) {
			response.status(404).endI();
		} else {
			redirectToBuild(response, buildList[0]);
		}
	})
});

app.get('/v/:buildNumber', function(req, response) {
	var buildNumber = req.params.buildNumber;
	if (!buildNumber) {
		response.status(400).end();
		return;
	}
	findBuildByBuildBumber(buildNumber, 0, function(build) {
		if (!build) {
			response.status(404).end();
			return;
		}
		redirectToBuild(response, build);
	});
});


// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

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

function findBuildByBundleVersion(bundleVersion, seek, callback) {
	var pattern = new RegExp("^.*?\\(" + bundleVersion + "\\)$");
	var pageSize = 100;
	request.get({
		url: 'https://testflightapp.com/m/api/apps/' + tfAppId,
		qs: {
			seek: seek,
			pagesize: pageSize
		}
	}, function(err, res, body) {
		var buildList = body['list'];

		// Empty build list means that we've exhausted all builds
		if (buildList.length == 0) {
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
		findBuildByBundleVersion(bundleVersion, seek + pageSize, callback);
	});
}

app.get('/install/latest', function(req, response) {
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

app.get('/install', function(req, response) {
	var bundle_version = req.query.bundle_version;
	if (!bundle_version) {
		response.status(400);
		return;
	}
	findBuildByBundleVersion(bundle_version, 0, function(build_info) {
		if (!build_info) {
			response.status(404).end();
			return;
		}
		request.get('https://testflightapp.com/m/api/apps/' + tfAppId + '/' + build_info['id'], function(err, res, body) {
			console.log('will redirect to ' + body['install_url']);
			response.redirect(body['install_url']);
		});
	});
});


// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);

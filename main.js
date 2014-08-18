var request = require('request').defaults({jar: true});
var jsdom = require('jsdom');
var jquery = require('jquery');
var express = require('express');
var app = express();




app.get('/', function(req, response) {
	request.get('https://testflightapp.com/login/', function(err, res, body) {
	  	jsdom.env(body, function(err, window) {
			var $ = jquery(window);
			var csrf = $('input[name=csrfmiddlewaretoken]').val();
			console.log('csrf ', csrf);

			request.post('https://testflightapp.com/login/', {
				headers: {
					'Referer': 'https://testflightapp.com/login/'
				},
				form: {
					'csrfmiddlewaretoken': csrf,
					'username': 'tony@happybits.co',
					'password': '******'
				}
			}, function(err, res, body) {
				console.log(res.statusCode);
				// console.log(res.headers);
				var url = 'https://www.testflightapp.com/install/65d3029c8f088f160f35d40b89c3612e-MTI1NTU5NjM/';
				url = 'https://www.testflightapp.com/dashboard/ipa/65d3029c8f088f160f35d40b89c3612e-MTI1NTU5NjM/'
				request.get(url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7'
					},
					followRedirect: false
				}, function(err, res, body) {
					console.log(res.statusCode);
					console.log(res.headers);
					response.redirect(res.headers['location']);
				});
			});

		});
	});
});

app.listen(3000);
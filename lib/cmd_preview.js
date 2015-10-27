var express = require('express'),
	serveStatic = require('serve-static'),
	path = require('path'),
	utils = require('./utils'),
	open = require('open');

module.exports = function(dir) {
	dir = dir || '.';

	var app = express(),
		router = express.Router();
	app.use('/assets', serveStatic(path.resolve(dir, 'assets')));
	app.use(router);

	router.get('/posts/*', function(req, res, next){
		var name = utils.stripExtname(req.params[0]),
			file = path.resolve(dir, '_posts', name + '.md'),
			html = utils.renderPost(dir, file);
		res.end(html);
	});

	router.get('/', function(req, res, next){
		var html = utils.renderIndex(dir);
		res.end(html);
	});

	var config = utils.loadConfig(dir),
		port = config.port || 3000,
		url = 'http://127.0.0.1:' + port;
	app.listen(port);
	open(url);
};
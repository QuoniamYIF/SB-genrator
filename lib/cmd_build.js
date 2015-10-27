var path = require('path'),
	utils = require('./utils'),
	fse = require('fs-extra');

module.exports = function(dir, options) {
	dir = dir || '.';
	var outputDir = path.resolve(options.output || dir);

	function outputFile(file, content){
		console.log('生成页面：%s', file.slice(outputDir.length + 1));
		fse.outputFileSync(file, content);
	}

	var sourceDir = path.resolve(dir, '_posts');
	utils.eachSourceFile(sourceDir, function(f, s){
		var html = utils.renderPost(dir, f),
			relativeFile = utils.stripExtname(f.slice(sourceDir.length + 1)) + '.html',
			file = path.resolve(outputDir, 'posts', relativeFile);
		outputFile(file, html);
	});

	var htmlIndex = utils.renderIndex(dir),
		fileIndex = path.resolve(outputDir, 'index.html');
	outputFile(fileIndex, htmlIndex);
};
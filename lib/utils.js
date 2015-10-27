var path = require('path'),
	fs = require('fs'),
	MarkdownIt = require('markdown-it'),
	md = new MarkdownIt({
		html: true,
		langPrefix: 'code-'
	}),
	swig = require('swig'),
	rd = require('rd');

swig.setDefaults({cache: false});

function stripExtname(name) {
	var i = 0 - path.extname(name).length;
	if( i === 0) i = name.length;
	return name.slice(0, i);
}

function markdownToHTML(content) {
	return md.render(content || '');
}

function parseSourceContent (data) {
	var split = '---\n',
		i = data.indexOf(split),
		info = {};
	if(i !== -1) {
		var j = data.indexOf(split, i + split.length);
		if(j !== -1) {
			var str = data.slice(i + split.length, j).trim();
			data = data.slice(j + split.length);
			str.split('\n').forEach(function (line){
				var i = line.indexOf(':');
				if(i !== -1) {
					var value = line.slice(i + 1).trim(),
						name = line.slice(0, i).trim();
					info[name] = value;
				}
			});
		}
	}
	info.source = data;
	return info;
}

function renderFile(file, data){
	return swig.render(fs.readFileSync(file).toString(), {
		filename: file,
		autoescape: false,
		locals: data
	});
}

function eachSourceFile(sourceDir, callback) {
	rd.eachFileFilterSync(sourceDir, /\.md$/, callback);
}

function renderPost(dir, file) {
	var content = fs.readFileSync(file).toString(),
		post = parseSourceContent(content.toString()),
		config = loadConfig(dir);
	post.content = markdownToHTML(post.source);
	post.layout = post.layout || 'post';
	var layout = path.resolve(dir, '_layout', post.layout + '.html'),
		html = renderFile(layout, {
			post: post,
			config: config
		});
	return html;
}

function renderIndex(dir) {
		var list = [],
			sourceDir = path.resolve(dir, '_posts'),
			config = loadConfig(dir);
		eachSourceFile(sourceDir, function(f,s){
			var source = fs.readFileSync(f).toString(),
				post = parseSourceContent(source);
			post.timestamp = new Date(post.date);
			post.url = '/posts/' + stripExtname(f.slice(sourceDir.length + 1)) + '.html';
			list.push(post);
		});

		list.sort(function(a, b) {
			return b.timestamp - a.timestamp;
		});

		var layout = path.resolve(dir, '_layout', 'index.html'),
		html = renderFile(layout, {
			config: config,
			posts: list
		});
		return html;
}

function loadConfig(dir) {
	var content = fs.readFileSync(path.resolve(dir, 'config.json')).toString(),
		data = JSON.parse(content);
	return data;
}

exports.renderPost = renderPost;
exports.renderIndex = renderIndex;
exports.stripExtname = stripExtname;
exports.eachSourceFile = eachSourceFile;
exports.loadConfig = loadConfig;

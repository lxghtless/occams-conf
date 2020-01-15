const fs = require('fs');
const http = require('http');
const https = require('https');
const isUrl = require('is-url-superb');
const log = require('./logger');

const urlLoader = path => {
	let client = https;

	if (path.split(':')[0].toLowerCase() === 'http') {
		client = http;
	}

	return new Promise((resolve, reject) => {
		client.get(path, resp => {
			let data = '';

			resp.on('data', chunk => {
				data += chunk;
			});

			resp.on('end', () => {
				resolve(data);
			});
		}).on('error', error => {
			reject(error);
		});
	});
};

module.exports = () => ({
	loadByPath(path) {
		log.debug('loading by path', path);
		if (isUrl(path)) {
			return urlLoader(path);
		}

		return fs.readFileSync(path, {encoding: 'utf-8'});
	}
});

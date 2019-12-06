const fs = require('fs');
const https = require('https');
const isUrl = require('is-url-superb');
const log = require('./logger');

const urlLoader = path => {
	return new Promise((resolve, reject) => {
		https.get(path, resp => {
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

const fs = require('fs');
// const {promisify} = require('util');
const https = require('https');
const isUrl = require('is-url-superb');

// const readFileAsync = promisify(fs.readFile);

// const fsLoader = path => readFileAsync(path);

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
		if (isUrl(path)) {
			return urlLoader(path);
		}

		return fs.readFileSync(path, {encoding: 'utf-8'});
	}
});

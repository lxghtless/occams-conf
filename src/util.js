const {existsSync, lstatSync} = require('fs');
const {join, dirname} = require('path');
const findUp = require('find-up');
const isUrl = require('is-url-superb');

const isDirectory = path => existsSync(path) && lstatSync(path).isDirectory();

const jsonParse = json => JSON.parse(json);

const get = (p, o) =>
	p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

const getGlobal = keyPath => process ? get(keyPath, process) : null;

const isGloballyInstalled = () => {
	if (process) {
		return require('is-installed-globally');
	}

	return false;
};

const isLocalModule = configPath => !isUrl(configPath) && configPath.endsWith('.js');

const getLocatorConfigPath = options => {
	if (isGloballyInstalled()) {
		const filePath = findUp.sync('package.json', options);
		return dirname(filePath);
	}

	if (process) {
		return process.cwd();
	}

	return '';
};

const getLocatorConfigFilePath = path => {
	const locatorConfigPath = getLocatorConfigPath(path);
	let locatorConfigFile = 'occams.conf.json';
	let locatorConfigFilePath = join(locatorConfigPath, locatorConfigFile);

	if (!findUp.sync.exists(locatorConfigFilePath)) {
		locatorConfigFile = 'occams.conf.js';
		locatorConfigFilePath = join(locatorConfigPath, locatorConfigFile);
	}

	if (!findUp.sync.exists(locatorConfigFilePath)) {
		locatorConfigFile = 'package.json';
		locatorConfigFilePath = join(locatorConfigPath, locatorConfigFile);
	}

	return locatorConfigFilePath;
};

module.exports = {
	isLocalModule,
	jsonParse,
	get,
	getGlobal,
	getLocatorConfigFilePath,
	isDirectory,
	isGloballyInstalled
};


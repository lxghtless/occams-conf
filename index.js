const path = require('path');
const fs = require('fs');

const cwd = process.cwd();
const occamsPackageNode = 'occams-conf';
const packageJsonPath = path.join(cwd, 'package.json');
const occamsSettingsPath = path.join(cwd, 'occams.conf.js');
const occamsSettingsJsonPath = path.join(cwd, 'occams.conf.json');
const defaultConfigPath = './';
const defaultConfigName = 'config.js';

// Source:
// https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
const get = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

let occamsSettings;

/**
	Occams Settings Priority Order
	1. occams.conf.js
	2. occams.conf.json
	3. package.json
	4. default settings
*/

if (fs.existsSync(occamsSettingsPath)) {
	const settings = require(occamsSettingsPath);
	occamsSettings = {
		configPath: get(['path'], settings) || defaultConfigPath,
		configName: get(['name'], settings) || defaultConfigName
	};
} else if (fs.existsSync(occamsSettingsJsonPath)) {
	const settings = require(occamsSettingsJsonPath);
	occamsSettings = {
		configPath: get(['path'], settings) || defaultConfigPath,
		configName: get(['name'], settings) || defaultConfigName
	};
} else if (fs.existsSync(packageJsonPath)) {
	const packageJson = require(packageJsonPath);
	occamsSettings = {
		configPath:
			get([occamsPackageNode, 'path'], packageJson) || defaultConfigPath,
		configName:
			get([occamsPackageNode, 'name'], packageJson) || defaultConfigName
	};
} else {
	occamsSettings = {
		configPath: defaultConfigPath,
		configName: defaultConfigName
	};
}

let occamsConf = {};

const loadConfig = ({configPath, configName}) => {
	let conf = {};

	const configFilePath = path.join(cwd, configPath, configName);

	try {
		conf = require(configFilePath);
		occamsConf = Object.assign(occamsConf, conf);
	} catch (error) {
		throw new Error(`No occams-conf found at ${configFilePath}`);
	}

	return occamsConf;
};

occamsConf.loadConfig = loadConfig;

module.exports = occamsConf.loadConfig(occamsSettings);

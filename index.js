/*
	occams-conf
	author: github.com/lxghtless
*/
const path = require('path');
const fs = require('fs');

/*
	stubs for brevity
*/
const cwd = process.cwd();

/*
	supported settings file names
*/
const confSettingsFileName = 'occams.conf.js';
const confSettingsJsonFileName = 'occams.conf.json';
const packageJsonFileName = 'package.json';

/*
	safely find a path value of an object given the path parts broken out into an array
*/
const get = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

/*
	lazy wrapper around a simple json compare
*/
const eq = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2);

/*
	humanized fs & path wrappers
*/
const notFile = p => !fs.existsSync(p);
const isFile = p => fs.existsSync(p);
const makePath = parts => path.join(...parts);
const aboveHere = here => path.dirname(here);
const hereName = here => path.basename(here);

/*
	log for troubleshooting
*/
const as = c => JSON.stringify(c);
// const log = m => process.stdout.write(`${m}\n`);
const log = () => {};

/*
	defaults and templates
*/
// const loadConfigError = m => `Error in occams-conf: ${m}`;
const coreDefaults = {configPath: './', configName: 'config.js'};

/*
	given a base directory, attempt to locate one of the possible settings files
	by cycling through the list of locators and return the first one it finds
*/
const locateSettings = (fsPath, path) => {
	if (isFile(fsPath)) {
		const settings = require(fsPath);
		const result = {};
		const configPath = get((path ? [path, 'path'] : ['path']), settings);
		if (configPath) {
			result.configPath = configPath;
		}

		const configName = get((path ? [path, 'name'] : ['name']), settings);
		if (configName) {
			result.configName = configName;
		}

		return result;
	}
};

/*
	given a base directory, attempt to locate one of the possible settings files
	by cycling through the list of locators and return the first one it finds
*/
const resolveSettings = (baseDir = cwd) => {
	const locators = [{
		fsPath: makePath([baseDir, packageJsonFileName]),
		baseDir,
		path: 'occams-conf'
	}, {
		fsPath: makePath([baseDir, confSettingsFileName]),
		baseDir
	}, {
		fsPath: makePath([baseDir, confSettingsJsonFileName]),
		baseDir
	}];

	for (const locator of locators) {
		const {fsPath, path} = locator;
		const settings = locateSettings(fsPath, path);
		if (settings && !eq(settings, {})) {
			return {
				...coreDefaults,
				...settings,
				...locator
			};
		}
	}

	return {
		...coreDefaults,
		baseDir
	};
};

/*
	walkback from "here" and resolve settings until it can't
*/
const walkback = here => {
	const above = aboveHere(here);
	const aboveName = above ? hereName(above) : undefined;
	if (aboveName && aboveName !== 'node_modules') {
		const baseDir = above;
		const {configPath, configName} = resolveSettings(baseDir);
		const configFile = makePath([baseDir, configPath, configName]);
		if (notFile(configFile)) {
			log(`walking back $ ${baseDir} ..`);
			return walkback(baseDir);
		}

		return configFile;
	}
};

/*
	occams-conf wrapper
*/
let occamsConf = {};

/*
	options (optional):
		configPath String (required)
		configName String (required)
		baseDir: String (required if configPath is not absolute)
	return config content as json assigned with occamsConf
*/
const loadConfig = (options = resolveSettings()) => {
	const {configPath, configName, baseDir} = options;
	let configFile;

	log(as({configPath, configName, baseDir}));

	if (path.isAbsolute(configPath)) {
		log('is absolute:');
		configFile = makePath([configPath, configName]);
		log(configFile);
	} else {
		log('is relative:');
		configFile = makePath([baseDir, configPath, configName]);
		log(configFile);
	}

	if (notFile(configFile)) {
		log('is walkback:');
		configFile = walkback(__dirname);
		log(configFile);
	}

	if (notFile(configFile)) {
		log('file not found');
		return occamsConf;
	}

	try {
		const conf = require(configFile);
		occamsConf = Object.assign(occamsConf, conf);
		log('config loaded');
		log(as(occamsConf));
	} catch (error) {
		// options:
		// 1. returning occamsConf here
		// 2. supporting an option to return occamsConf here
		// 3. log and do nothing
		// 4. throw error
		log(`error: ${error.message}`);
		// throw new Error(loadConfigError(error.message));
		// return occamsConf;
	}

	return occamsConf;
};

occamsConf.loadConfig = loadConfig.bind(occamsConf);

module.exports = occamsConf.loadConfig();

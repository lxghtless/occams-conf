const {homedir: getUserHome} = require('os');
const {join} = require('path');
const isUrl = require('is-url-superb');
const log = require('./logger');
const loader = require('./loader');
const {
	isLocalModule,
	get,
	getGlobal,
	getLocatorConfigFilePath,
	isGloballyInstalled,
	jsonParse
} = require('./util');

const parseLocatorConfig = async (locatorConfigFilePath, locatorConfigGetter) => {
	let locatorConfig;

	if (isUrl(locatorConfigFilePath)) {
		locatorConfig = jsonParse(await locatorConfigGetter());
	}

	if (!locatorConfig) {
		locatorConfig = jsonParse(locatorConfigGetter());
	}

	if (locatorConfigFilePath.includes('package.json')) {
		return locatorConfig['occams-conf'];
	}

	return locatorConfig;
};

const parseConfig = async (configPath, configGetter) => {
	if (isLocalModule(configPath)) {
		return require(configPath);
	}

	return jsonParse(await configGetter());
};

module.exports = context => ({
	loader: loader(),
	// This path overrides the path
	configPathOverride: getGlobal(['env', 'OCCAMS_CONF_CONFIG_FILE_PATH']),
	manualInitMode: getGlobal(['env', 'OCCAMS_CONF_MANUAL_INIT']) === 'true',
	isDevelopmentMode: getGlobal(['env', 'OCCAMS_CONF_ENV']) === 'development',
	locatorConfig: null,
	locatorConfigFilePath: null,
	configPath: null,
	keyPathTracker: new Set(),
	// The locatorConfigPath is the path to the directory containing the occams-conf
	// configuration file (i.e. occams.conf.js, occams.conf.json, package.json)
	setLocatorConfigFilePath(path) {
		let locatorConfigFilePath = path;

		if (!locatorConfigFilePath) {
			locatorConfigFilePath = this.configPathOverride;
		}

		if (!locatorConfigFilePath) {
			locatorConfigFilePath = getLocatorConfigFilePath();
		}

		this.locatorConfigFilePath = locatorConfigFilePath;

		log.info(`set locatorConfigFilePath: ${this.locatorConfigFilePath}`);

		return this;
	},
	async setLocatorConfig(path) {
		this.setLocatorConfigFilePath(path);
		this.locatorConfig = await parseLocatorConfig(
			this.locatorConfigFilePath,
			() => this.loader.loadByPath(this.locatorConfigFilePath)
		);

		// log.debug(`set locatorConfig: ${JSON.stringify(this.locatorConfig)}`);

		return this;
	},
	setConfigPath(locatorConfig = this.locatorConfig) {
		const {path, name} = locatorConfig;

		let configPath;

		if (!path && !name) {
			if (isGloballyInstalled()) {
				configPath = join(getUserHome(), 'config.js');
			} else {
				// TODO: get default from util
				configPath = join(process.cwd(), 'config.js');
			}
		}

		if (!configPath && path && name) {
			configPath = `${path}${name}`;
		}

		if (!configPath && path) {
			// TODO: check if path is a file path or dir
			// if file return path
			// if dir return path + (default config file name) (i.e. config.js)
			configPath = path;
		}

		if (!configPath) {
			configPath = join(process.cwd(), name);
		}

		this.configPath = configPath;

		log.info(`set configPath: ${this.configPath}`);

		return this;
	},
	async setConfig(locatorConfig = this.locatorConfig) {
		this.setConfigPath(locatorConfig);
		this.config = await parseConfig(
			this.configPath,
			() => this.loader.loadByPath(this.configPath)
		);

		// log.debug(`set config: ${JSON.stringify(this.config)}`);

		return this;
	},
	write(config = this.config) {
		log.debug('client write called');
		for (const ck of Object.keys(config)) {
			log.debug(`client write context key: {${ck}: "${config[ck]}"}`);
			context[ck] = config[ck];
			this.keyPathTracker.add(ck);
		}

		return this;
	},
	async init() {
		log.debug('client init called');
		await this.setLocatorConfig();
		await this.setConfig();
		return this.write();
	},
	get(keyPath) {
		// if no keyPath, then return just the loaded config keys
		if (!keyPath) {
			const partial = {};
			for (const kp of this.keyPathTracker) {
				partial[kp] = context[kp];
			}

			return partial;
		}

		let keyPathArray = keyPath;
		if (typeof keyPath === 'string') {
			keyPathArray = keyPath.split('.');
		}

		if (!Array.isArray(keyPathArray)) {
			throw new TypeError('invalid keyPath');
		}

		return get(keyPathArray, context);
	}
	// TODO: impl assoc path functionality
	// set(keyPath, value) {
	// }
});

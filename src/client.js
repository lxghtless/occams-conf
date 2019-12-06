const {homedir: getUserHome} = require('os');
const {join, isAbsolute} = require('path');
const isUrl = require('is-url-superb');
const log = require('./logger');
const loader = require('./loader');
const {
	isLocalModule,
	get,
	getGlobal,
	getLocatorConfigFilePath,
	isDirectory,
	isGloballyInstalled,
	jsonParse
} = require('./util');

const DEFAULT_CONFIG_FILE_NAME = 'config.js';

const parseLocatorConfig = (locatorConfigFilePath, locatorConfigGetter) => {
	log.debug('using jsonParse to parse locatorConfig');
	const locatorConfig = jsonParse(locatorConfigGetter());

	if (locatorConfigFilePath.includes('package.json')) {
		log.debug('locatorConfig detected as package.json');
		log.debug('locatorConfig-occams-conf', locatorConfig['occams-conf']);
		return locatorConfig['occams-conf'];
	}

	return locatorConfig;
};

const parseLocatorConfigAsync = async (locatorConfigFilePath, locatorConfigGetter) => {
	let locatorConfig;

	if (isUrl(locatorConfigFilePath)) {
		log.debug('using jsonParse with await to parse locatorConfig');
		locatorConfig = jsonParse(await locatorConfigGetter());
	}

	if (!locatorConfig) {
		log.debug('using jsonParse to parse locatorConfig');
		locatorConfig = jsonParse(locatorConfigGetter());
	}

	if (locatorConfigFilePath.includes('package.json')) {
		log.debug('locatorConfig detected as package.json');
		log.debug('locatorConfig-occams-conf', locatorConfig['occams-conf']);
		return locatorConfig['occams-conf'];
	}

	return locatorConfig;
};

const parseConfig = (configPath, configGetter) => {
	if (isLocalModule(configPath)) {
		return require(configPath);
	}

	return jsonParse(configGetter());
};

const parseConfigAsync = async (configPath, configGetter) => {
	if (isLocalModule(configPath)) {
		return require(configPath);
	}

	return jsonParse(await configGetter());
};

module.exports = context => ({
	loader: loader(),
	configPathOverride: getGlobal(['env', 'OCCAMS_CONF_CONFIG_FILE_PATH']),
	manualInitMode: getGlobal(['env', 'OCCAMS_CONF_MANUAL_INIT']) === 'true',
	isDevelopmentMode: getGlobal(['env', 'OCCAMS_CONF_ENV']) === 'development',
	locatorConfig: null,
	locatorConfigFilePath: null,
	configPath: null,
	keyPathTracker: new Set(),
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
	setLocatorConfig(path) {
		this.setLocatorConfigFilePath(path);
		this.locatorConfig = parseLocatorConfig(
			this.locatorConfigFilePath,
			() => this.loader.loadByPath(this.locatorConfigFilePath)
		);

		log.debug(`set locatorConfig: ${JSON.stringify(this.locatorConfig)}`);

		return this;
	},
	async setLocatorConfigAsync(path) {
		this.setLocatorConfigFilePath(path);
		this.locatorConfig = await parseLocatorConfigAsync(
			this.locatorConfigFilePath,
			() => this.loader.loadByPath(this.locatorConfigFilePath)
		);

		log.debug(`set locatorConfigAsync: ${JSON.stringify(this.locatorConfig)}`);

		return this;
	},
	setConfigPath(locatorConfig = this.locatorConfig) {
		const {path, name} = locatorConfig;

		let configPath;

		if (!path && !name) {
			if (isGloballyInstalled()) {
				log.debug('module detected as globally installed');
				configPath = join(getUserHome(), DEFAULT_CONFIG_FILE_NAME);
				log.debug(`global module config path: ${configPath}`);
			} else {
				log.debug(`${configPath} detected as locally installed`);
				configPath = join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);
			}
		}

		if (!configPath && path && name) {
			configPath = join(path, name);
			if (isAbsolute(configPath)) {
				log.debug(`${configPath} detected as absolute`);
			} else {
				log.debug(`${configPath} detected as relative`);
				configPath = join(process.cwd(), configPath);
			}
		}

		if (!configPath && path) {
			if (isDirectory(path)) {
				configPath = join(path, DEFAULT_CONFIG_FILE_NAME);
			} else {
				configPath = path;
			}
		}

		if (!configPath) {
			configPath = join(process.cwd(), name);
			if (isDirectory(configPath)) {
				configPath = join(configPath, DEFAULT_CONFIG_FILE_NAME);
			}
		}

		this.configPath = configPath;

		log.info(`set configPath: ${this.configPath}`);

		return this;
	},
	setConfig(locatorConfig = this.locatorConfig) {
		this.setConfigPath(locatorConfig);
		this.config = parseConfig(
			this.configPath,
			() => this.loader.loadByPath(this.configPath)
		);

		log.debug('client setConfig complete');

		return this;
	},
	async setConfigAsync(locatorConfig = this.locatorConfig) {
		this.setConfigPath(locatorConfig);
		this.config = await parseConfigAsync(
			this.configPath,
			() => this.loader.loadByPath(this.configPath)
		);

		log.debug('client setConfigAsync complete');

		return this;
	},
	write(config = this.config) {
		log.debug('client write called');
		for (const ck of Object.keys(config)) {
			log.debug(`context partial "${ck}" written`);
			context[ck] = config[ck];
			this.keyPathTracker.add(ck);
		}

		return this;
	},
	async loadConfig(locatorConfig) {
		log.debug('client loadConfig called');
		await this.setConfig(locatorConfig);
		await this.write();
		return this.get();
	},
	init(locatorConfigPath) {
		log.debug('client init called');
		this.setLocatorConfigFilePath(locatorConfigPath);

		if (isUrl(this.locatorConfigFilePath)) {
			const initAsync = async () => {
				await this.setLocatorConfigAsync(locatorConfigPath);
				await this.setConfigAsync();
				return this.write();
			};

			return initAsync();
		}

		this.setLocatorConfig(locatorConfigPath);
		this.setConfig();
		return this.write();
	},
	get(keyPath) {
		log.debug(`client get called with ${keyPath}`);

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
});

const {join, isAbsolute} = require('path');
const requireFromString = require('require-from-string');
const isUrl = require('is-url-superb');
const log = require('./logger');
const {
	isLocalModule,
	jsonParse
} = require('./util');

const resolveFullModulePath = modulePath => {
	if (!isAbsolute(modulePath)) {
		return join(
			// CONSIDERATION: abstract getting default base to enable configuration of this value
			process.cwd(),
			modulePath);
	}

	return modulePath;
};

const parseLocatorConfig = (locatorConfigFilePath, locatorConfigGetter) => {
	let locatorConfig;

	if (locatorConfigFilePath.endsWith('.json')) {
		log.debug('locatorConfigFilePath async detected as json from path');
		locatorConfig = jsonParse(locatorConfigGetter());
		if (locatorConfigFilePath.endsWith('package.json')) {
			locatorConfig = locatorConfig['occams-conf'] || {};
		}
	} else {
		log.debug('locatorConfigFilePath async detected as module from path');
		const modulePath = resolveFullModulePath(locatorConfigFilePath);
		return require(modulePath);
	}

	return locatorConfig;
};

const parseLocatorConfigAsync = async (locatorConfigFilePath, locatorConfigGetter) => {
	if (isUrl(locatorConfigFilePath)) {
		if (locatorConfigFilePath.endsWith('.json')) {
			log.debug('locatorConfigFilePath async detected as json from url');
			const lcJson = jsonParse(await locatorConfigGetter());
			if (locatorConfigFilePath.endsWith('package.json')) {
				return lcJson['occams-conf'];
			}

			return lcJson;
		}

		log.debug('locatorConfigFilePath async detected as module from url');
		return requireFromString(await locatorConfigGetter());
	}

	return parseLocatorConfig(locatorConfigFilePath, locatorConfigGetter);
};

const parseConfig = (configPath, configGetter) => {
	if (isLocalModule(configPath)) {
		log.debug('configPath detected as local module');
		const modulePath = resolveFullModulePath(configPath);
		return require(modulePath);
	}

	log.debug('configPath detected as json');
	return jsonParse(configGetter());
};

const parseConfigAsync = async (configPath, configGetter) => {
	if (isUrl(configPath)) {
		if (configPath.endsWith('.json')) {
			log.debug('configPath async detected as json from url');
			return jsonParse(await configGetter());
		}

		log.debug('configPath async detected as module from url');
		const jsModuleText = await configGetter();
		return requireFromString(jsModuleText);
	}

	return parseConfig(configPath, configGetter);
};

module.exports = {
	parseLocatorConfig,
	parseLocatorConfigAsync,
	parseConfig,
	parseConfigAsync
};

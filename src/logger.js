const isDevelopmentMode =
	process.env.NODE_ENV === 'development' ||
	process.env.OCCAMS_CONF_ENV === 'development';

const createBasicLogger = () => {
	const {Writable} = require('stream');
	class WritableStream extends Writable {}

	const {Console} = console;

	const stdoutStream = isDevelopmentMode ? process.stdout : new WritableStream();
	const stderrStream = isDevelopmentMode ? process.stderr : new WritableStream();

	return new Console({
		stdout: stdoutStream,
		stderr: stderrStream,
		colorMode: 'auto'
	});
};

let logger;

const loggerModuleName = process.env.OCCAMS_CONF_LOGGER_MODULE;
const loggerModuleCreateMethodName = process.env.OCCAMS_CONF_LOGGER_MODULE_CREATE_METHOD;

if (loggerModuleName) {
	try {
		const loggerModulePath = require.resolve(loggerModuleName);
		const loggerModule = require(loggerModulePath);
		if (loggerModuleCreateMethodName) {
			logger = loggerModule[loggerModuleCreateMethodName]();
		} else {
			logger = loggerModule;
		}
	} catch (error) {
		logger = createBasicLogger();
		logger.error('occams-conf error while loading logger module.', error);
	}
} else {
	logger = createBasicLogger();
}

module.exports = logger;

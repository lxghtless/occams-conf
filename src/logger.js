const {Writable} = require('stream');

const isDevelopmentMode =
	process.env.NODE_ENV === 'development' ||
	process.env.OCCAMS_CONF_ENV === 'development';

class WritableStream extends Writable {}

const {Console} = console;

const stdoutStream = isDevelopmentMode ? process.stdout : new WritableStream();
const stderrStream = isDevelopmentMode ? process.stderr : new WritableStream();

module.exports = new Console({
	stdout: stdoutStream,
	stderr: stderrStream,
	colorMode: 'auto'
});

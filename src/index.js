const context = require('./context');
const log = require('./logger');

// initialize context client
const ctx = context()[context.InitSymbol]();
const ctxClient = ctx[context.ClientSymbol];

const isPromise = object => {
	if (Promise && Promise.resolve) {
		return Promise.resolve(object) === object;
	}

	return false;
};

// if not manual mode, attempt to init immediately
if (!ctxClient.manualInitMode) {
	(() => {
		try {
			const initialization = ctx.init();
			const initIsPromise = isPromise(initialization);
			log.debug(`auto init detected as ${initIsPromise ? 'async' : 'sync'}`);
		} catch (error) {
			log.error(error);
		}
	})();
}

module.exports = ctx;
module.exports.ClientSymbol = context.ClientSymbol;

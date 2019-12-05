const context = require('./context');
const log = require('./logger');

const {ClientSymbol, InitSymbol} = context;

// initialize context client
const ctx = context()[InitSymbol]();
const ctxClient = ctx[ClientSymbol];

// if not manual mode, attempt to init immediately
if (!ctxClient.manualInitMode) {
	(async () => {
		try {
			await ctxClient.init();
			log.debug(ctx.get());
		} catch (error) {
			console.error(error);
			log.error(error);
		}
	})();
}

module.exports = ctx;
module.exports.ClientSymbol = ClientSymbol;

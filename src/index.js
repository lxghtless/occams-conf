const context = require('./context');
const log = require('./logger');

// initialize context client
const ctx = context()[context.InitSymbol]();
const ctxClient = ctx[context.ClientSymbol];

// if not manual mode, attempt to init immediately
if (!ctxClient.manualInitMode) {
	(async () => {
		try {
			await ctx.init();
			log.debug(ctx.get());
		} catch (error) {
			console.error(error);
			log.error(error);
		}
	})();
}

module.exports = ctx;
module.exports.ClientSymbol = context.ClientSymbol;

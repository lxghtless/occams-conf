const client = require('./client');
const log = require('./logger');

const ClientSymbol = Symbol('occams.conf.client');
const InitSymbol = Symbol('occams.conf.context.init');

const contextFactory = () => ({
	[InitSymbol]() {
		log.debug('initializing context client');
		this[ClientSymbol] = client(this);
		this.init = this[ClientSymbol].init.bind(this[ClientSymbol]);
		this.get = this[ClientSymbol].get.bind(this[ClientSymbol]);
		this.loadConfig = this[ClientSymbol].loadConfig.bind(this[ClientSymbol]);
		log.debug('context client initialized');
		return this;
	}
});

contextFactory.ClientSymbol = ClientSymbol;
contextFactory.InitSymbol = InitSymbol;

module.exports = contextFactory;

const test = require('ava');

test('load config with default settings', async t => {
	try {
		const config = require('../src');
		await config[config.ClientSymbol].init();
		t.truthy(config);
		t.is(config.port, 3000);
		t.is(config.name, 'demo');
		t.is(config.resourceUrl, 'https://reqres.in/api/apps');
	} catch (error) {
		t.log(error);
		t.fail();
	}
});

const test = require('ava');

const unitTestConfigJsFilePath = 'test.config.js';

test('load config from file as js module', async t => {
	try {
		const config = require('../src');

		await config.loadConfig({
			path: unitTestConfigJsFilePath
		});

		t.is(config.fileConfig.mode, 'test-js');
	} catch (error) {
		t.log(error);
		t.fail();
	}
});

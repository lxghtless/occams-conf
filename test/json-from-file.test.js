const test = require('ava');

const unitTestConfigJsonFilePath = 'test.config.json';

test('load config from file as json', async t => {
	try {
		const config = require('../src');

		await config.loadConfig({
			path: unitTestConfigJsonFilePath
		});

		t.is(config.fileConfig.mode, 'test-json');
	} catch (error) {
		t.log(error);
		t.fail();
	}
});

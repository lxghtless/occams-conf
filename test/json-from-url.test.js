const test = require('ava');
const nock = require('nock');

const unitTestConfigUrl = 'http://localhost:3000';
const unitTestConfigJsonFilePath = '/config-from-url.json';

const unitTestConfigJson = JSON.stringify({webConfig: {mode: 'test-json'}});

test.beforeEach(t => {
	t.context.scope = nock(unitTestConfigUrl)
		.get(unitTestConfigJsonFilePath)
		.reply(200, unitTestConfigJson);
});

test('load config from url as json', async t => {
	try {
		const config = require('../src');

		await config.loadConfig({
			path: `${unitTestConfigUrl}${unitTestConfigJsonFilePath}`
		});

		t.is(config.webConfig.mode, 'test-json');
	} catch (error) {
		t.log(error);
		t.fail();
	}
});

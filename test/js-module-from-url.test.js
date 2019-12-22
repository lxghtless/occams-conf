const test = require('ava');
const nock = require('nock');

const unitTestConfigUrl = 'http://localhost:3000';
const unitTestConfigJsFilePath = '/config-from-url.js';

const unitTestConfigJs = `
const webConfig = {
    mode: 'test-js'
};

module.exports = {
    webConfig
};
`;

test.beforeEach(t => {
	t.context.scope = nock(unitTestConfigUrl)
		.get(unitTestConfigJsFilePath)
		.reply(200, unitTestConfigJs);
});

test('load config from url as js module', async t => {
	try {
		const config = require('../src');

		await config.loadConfig({
			path: `${unitTestConfigUrl}${unitTestConfigJsFilePath}`
		});

		t.is(config.webConfig.mode, 'test-js');
	} catch (error) {
		t.log(error);
		t.fail();
	}
});

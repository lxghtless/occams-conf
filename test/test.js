const test = require('ava');

test('occams-conf should load config file as object', t => {
	const occamsConf = require('..');
	t.truthy(occamsConf);
	t.is(occamsConf.port, 3000);
	t.is(occamsConf.name, 'test-name');
});

test('occams-conf should load config with main config', t => {
	const occamsConf = require('..').loadConfig({
		configName: 'config.js',
		configPath: 'test'
	});
	t.truthy(occamsConf);
	t.is(occamsConf.port, 4000);
	t.is(occamsConf.name, 'test-name');
	t.is(occamsConf.resourceUrl, 'http://resource.com');
});

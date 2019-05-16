const test = require('ava');

test('load config default', t => {
	const occamsConf = require('..');
	t.truthy(occamsConf);
	t.is(occamsConf.port, 3000);
	t.is(occamsConf.name, 'demo');
	t.is(occamsConf.resourceUrl, 'https://reqres.in/api/apps');
});

test('load a config and load in another', t => {
	const occamsConf = require('..').loadConfig({
		configName: 'testConf.js',
		configPath: 'test-configs',
		baseDir: process.cwd()
	});
	t.truthy(occamsConf);
	t.is(occamsConf.port, 8011);
	t.is(occamsConf.name, 'starlord');
	t.is(occamsConf.resourceUrl, 'https://reqres.in/api/mixtapes');
});

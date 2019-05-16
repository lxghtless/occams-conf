const test = require('ava');

const {HOME} = process.env;

test('load config from absolute path', t => {
	const occamsConf = require('..').loadConfig({
		configName: 'config.js',
		configPath: `${HOME}/Desktop`,
		locator: {
			baseDir: process.cwd()
		}
	});
	t.truthy(occamsConf);
	t.is(occamsConf.port, 3000);
	t.is(occamsConf.name, 'stark');
	t.is(occamsConf.resourceUrl, 'https://reqres.in/api/mks');
});

test('load config with walkback', t => {
	const occamsConf = require('..').loadConfig({
		configPath: './',
		configName: 'config.js',
		baseDir: `${HOME}/temp`
	});
	t.truthy(occamsConf);
	t.is(occamsConf.port, Infinity);
	t.is(occamsConf.name, 'thanos');
	t.is(occamsConf.resourceUrl, 'https://reqres.in/api/snaps');
});

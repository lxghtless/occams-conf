module.exports = {
	port: process.env.TEST_PORT || 8011,
	name: process.env.TEST_NAME || 'starlord',
	resourceUrl: process.env.TEST_URL || 'https://reqres.in/api/mixtapes'
};

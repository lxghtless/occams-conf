module.exports = {
	port: process.env.TEST_PORT || 3000,
	name: process.env.TEST_NAME || 'demo',
	resourceUrl: process.env.TEST_URL || 'https://reqres.in/api/apps'
};

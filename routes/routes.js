var contacts = require('./contacts');
var addressTypes = require('./addressTypes');
var phoneTypes = require('./phoneTypes');
var path = require('path');

exports.initRoutes = function (app) {
	app.use('/contacts', contacts); // contacts
	app.use('/address-types', addressTypes); // addres-types
	app.use('/phone-types', phoneTypes); // phone-types
	app.use(function(req, res) { // 404 error
		res.sendFile(path.resolve('webroot/404.html'));
	});
};
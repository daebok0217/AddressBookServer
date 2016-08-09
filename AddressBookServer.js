//include require module
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('./logger');
//include main router 
var routes = require('./routes/routes');

//create express app
var app = express();

//configure app to use bodyParser()
//this will let us get the data from a POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//init Serve static content for the app from the webroot directory in the application directory
app.use(express.static(__dirname + '/webroot'));
//init routes 
routes.initRoutes(app);

var config = {};
try{
  config = require('./webroot/config.json');
  //START server
  var server = app.listen(config.port || 18080);
  logger.log("info","Node app start");
}catch(e){
  logger.log("error","Cannot find module './webroot/config.json'");
}

//STOP server
//exporting this stop function so that it is accessible from the test cases
exports.stop = function(callback) {
  server.close();
  logger.log("info","Node app shutdown");
  callback();
}
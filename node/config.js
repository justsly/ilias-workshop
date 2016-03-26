//Config File for app.js
var config = {};

//WSDL URL
config.wsdl_url = "http://localhost/webservice/soap/server.php?wsdl";

// Define Server IP and Port
config.srv_ip = '192.168.56.101';
config.srv_port = 8080;

//Switch Debug mode on or off
config.inDebug = true;

module.exports = config;
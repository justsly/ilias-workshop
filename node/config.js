//Config File for app.js
var config = {};

//WSDL URL
config.wsdl_url = "http://localhost/webservice/soap/server.php?wsdl";

// Define Server IP and Port
config.srv_ip = '192.168.56.101';
config.srv_port = 8080;

//Auth Key to send Container Secret to REST Router
config.dc_auth = "c611795deb9b94c8f9ea7f1bae0884ab";

//Switch Debug mode on or off
config.inDebug = true;

module.exports = config;
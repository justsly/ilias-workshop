//Config File for app.js
var config = {};

//WSDL URL
config.wsdl_url = "http://localhost/ilias/webservice/soap/server.php?wsdl";

// Define Server IP and Port
config.listen_ip = '0.0.0.0';
config.redirect_ip = '81.7.10.250';
config.redirect_port = 80;
config.redirect_protocol = 'http';
config.srv_port = 8080;

//Auth Key to send Container Secret to REST Router
config.dc_auth = "c611795deb9b94c8f9ea7f1bae0884ab";

// Define SOAP Client, User and password
config.client_id = "ilias";

//Switch Debug mode on or off
config.inDebug = true;

//Define OAuth Credentials
config.consumer_secret = 'Xospnzq6v2Uror';

// default container lifetime in milliseconds
config.container_lifetime = (60 * 60 * 1000);

module.exports = config;



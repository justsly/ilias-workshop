//Config File for app.js
var config = {};

//WSDL URL
config.wsdl_url = "http://localhost/ilias/webservice/soap/server.php?wsdl";

// Define Server IP and Port
config.srv_ip = '81.7.10.250';
config.srv_port = 8080;

//Auth Key to send Container Secret to REST Router
config.dc_auth = "c611795deb9b94c8f9ea7f1bae0884ab";

// Define SOAP Client, User and password
config.client_id = "ilias";

//Switch Debug mode on or off
config.inDebug = true;

//Define OAuth Credentials
config.consumer_key = '12345';
config.consumer_secret = 'secret';

module.exports = config;
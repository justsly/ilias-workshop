//Config File for app.js
var config = {};

// Define Server IP and Port
config.listen_ip = '0.0.0.0';
config.redirect_ip = '127.0.0.1';
config.redirect_port = 80;
config.redirect_protocol = 'http';
config.srv_port = 8080;

// Define SOAP Client, User and password
config.client_id = "ilias";

//Switch Debug mode on or off
config.inDebug = true;

//Define OAuth Credentials
config.consumer_secret = 'XXXXXXXXXXX';

// default container lifetime in milliseconds
config.container_lifetime = (60 * 60 * 1000);

module.exports = config;



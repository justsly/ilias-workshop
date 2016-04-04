// Define some Framework Stuff
const lti = require('ims-lti');
const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config.js');
const app = express();

const WorkshopModule = require('./modules/WorkshopModule.js');


// destroy console.log in live mode, total silence
if (!config.inDebug) {
	console = console || {};
	console.log = function(){};
	console.warn = function(){};
	console.info = function(){};
	console.error = function(){};
}

// Middleware to parse body
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Register Server on Port
app.listen(config.srv_port, config.listen_ip, function(){
	console.log('Server running at http://'+config.listen_ip+':'+config.srv_port);
});

// Set CORS Definition here
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};
app.use(allowCrossDomain);

// Method to create Level from ILIAS
app.post('/container/create', function(req, res){
	console.log("POST /container/create called");
	if(req.body && req.body.level && req.body.user_id && req.body.launch_presentation_return_url && req.body.lis_outcome_service_url && req.body.oauth_consumer_key) {
		var provider = new lti.Provider(req.body.oauth_consumer_key, config.consumer_secret);
		provider.valid_request(req, function (err, is_valid) {
			// Check if the request is valid and if the outcomes service exists.
			console.log(req.body.oauth_consumer_key);
			if (!is_valid || !provider.outcome_service) {
				res.status(401).send({success: false, error: 'Unauthorized. Please navigate from ILIAS.'});
				console.log('wrong oauth');
			} else {
				console.log('oauth correct');
				console.log(req.body.lis_result_sourcedid);
				WorkshopModule.checkExistingContainer(req.body.user_id, req.body.level, function (error, exists) {
					if (!exists) {
						WorkshopModule.createDockerContainer(req.body.level, req.body.lis_result_sourcedid, req.body.lis_outcome_service_url, req.body.launch_presentation_return_url, req.body.oauth_consumer_key, req.body.user_id, function (err, docker_hash) {
							if (docker_hash) WorkshopModule.redirectToPort(docker_hash, res);
							else res.status(500).send({success: false, error: 'docker creation failed'});
						});
					} else WorkshopModule.redirectToPort(exists.docker_hash, res);
				});
			}
		});
	}
});

// Return to ILIAS with complete flag
app.get('/container/:docker_hash/complete/secret/:dc_secret', function(req, res){
	WorkshopModule.findContainerByHash(req.params.docker_hash, function(err, citem) {
        WorkshopModule.checkSecretExists(req.params.dc_secret, function(err, secret_exists){
            if(secret_exists){
                if(citem){
					WorkshopModule.sendSolutionToILIAS(citem.service_url, citem.source_id, citem.consumer_key, function(err, result) {
						if(result) {
							res.status(200).send({success:true, message: 'Mission solved.'});
							WorkshopModule.removeSecret(req.params.dc_secret);
						} else {
							res.status(500).send({success:false, message: 'Internal Error. Could not send solution to ILIAS.'});
						}
                        });
                } else {
                    res.status(404).send({success:false, error: 'container not found!'});
                }
            } else {
                res.status(401).send({success:false, error: 'Wrong secret!'});
            }
        })
	});
});

// Set Secret from Container
app.post('/container/secret', function(req, res){
    console.log("POST /container/secret called");
	if(req.body && req.body.dc_auth && req.body.secret){
		if(req.body.dc_auth == config.dc_auth){
            console.log("secret: "+ req.body.secret + " set");
			WorkshopModule.addSecret(req.body.secret);
			res.status(200).send({success:true});
		} else {
            res.status(500).send({success:false, error: 'wrong auth key. this is no challenge.'});
        }
	} else {
        res.status(500).send({success:false, error: 'Wrong Format. Please use JSON.'})
    }
});

// Define Routing for Container Flush
app.delete('/container/:docker_hash/end', function(req, res){
	WorkshopModule.findContainerByHash(req.params.docker_hash, function(err, citem) {
		if (citem) {
			WorkshopModule.destroyContainer(req.params.docker_hash);
			res.status(200).send({success: true, return_url: citem.return_url});
		} else {
			res.status(404).send({success: false, error: 'container not found!'});
		}
		res.end();
	});
});

// Default Catch for wrong URLs sends 404
app.get('*', function(req, res){
	res.status(404).send({success:false, error:"Ressource not found!"});
	res.end();
});


// Define Levels
WorkshopModule.addNewLevel(new WorkshopModule.Level('reflected_xss', 'ilias_xss01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('lfi', 'ilias_lfi01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('ping', 'ilias_cmdi01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('simple_login', 'ilias_sqli01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('error_based_sqli', 'ilias_sqli02'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('blind_sqli', 'ilias_sqli03'));
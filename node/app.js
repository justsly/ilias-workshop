//Workshop Module to keep functions safe
var WorkshopModule = (function () {

	//Define child process to handle the Docker environment
	var exec = require('child_process').exec;
	var container_list = [];
	var level_list = [];
	var secret_list = [];

	return {
		Level: function (lkey, lvalue) {
			this.lkey = lkey;
			this.lvalue = lvalue;
		},
		addNewLevel : function (litem){
			level_list.push(litem);
		},
		getLevelById: function (lkey, cb) {
			for (var i = 0; i < level_list.length; i++) {
				if (level_list[i].lkey === lkey) {
					return ((typeof(cb) === 'function') ? cb(null, level_list[i]) : level_list[i]);
				}
			}
			return ((typeof(cb) === 'function') ? cb(null, null) : null);
		},
		addSecret : function(dc_secret){
			secret_list.push(dc_secret);
		},
		checkSecretExists : function(dc_secret, cb){
			for (var i = 0; i < secret_list.length; i++) {
				if (secret_list[i] == dc_secret){
					return ((typeof(cb) === 'function') ? cb(null, true) : true);
				}
			}
			return ((typeof(cb) === 'function') ? cb(null, false) : false);
		},
        removeSecret: function (dc_secret) {
            for (var i = 0; i < container_list.length; i++) {
                if (secret_list[i] == dc_secret) {
                    secret_list.splice(i, 1);
                    return true;
                }
            }
            return false;
        },
		//Define object DockerContainer
		DockerContainer: function (docker_h, docker_p, source_id, service_url, return_url, consumer_key, uid, lid) {
			this.docker_hash = docker_h;
			this.docker_port = docker_p;
			this.source_id = source_id;
			this.service_url = service_url;
			this.return_url = return_url;
			this.consumer_key = consumer_key;
			this.uid = uid;
			this.lid = lid;
		},
		//Push new DockerContainer object to list
		addNewContainer: function (dc, cb) {
			container_list.push(dc);
			return ((typeof(cb) === 'function') ? cb(null, dc) : dc);
		},
		//Remove Secret from list if matches
		removeContainerByHash: function (docker_hash) {
			for (var i = 0; i < container_list.length; i++) {
				if (container_list[i].docker_hash == docker_hash) {
					container_list.splice(i, 1);
					return true;
				}
			}
			return false;
		},
		//Returns DockerContainer object from list if matches given hash
		findContainerByHash: function (docker_hash, cb) {
			for (var i = 0; i < container_list.length; i++) {
				if (container_list[i].docker_hash === docker_hash) {
					return ((typeof(cb) === 'function') ? cb(null, container_list[i]) : container_list[i]);
				}
			}
			return ((typeof(cb) === 'function') ? cb(null, null) : null);
		},
		//Returns DockerContainer object from list if matches given uid
		findContainerByUid: function (uid, cb){
			console.log("try to find: " + uid);
			for (var i = 0; i < container_list.length; i++) {
				if (container_list[i].uid === uid) {
					console.log("found " + uid);
					return ((typeof(cb) === 'function') ? cb(null, container_list[i]) : container_list[i]);
				}
			}
			return ((typeof(cb) === 'function') ? cb(null, null) : null);
		},
		//Create DockerContainer and redirect User to this Instance
		createDockerContainer: function (lid, source_id, service_url, return_url, consumer_key, uid, cb) {
			WorkshopModule.getLevelById(lid, function(err, litem) {
				if(litem) {
					console.log('level exists: ' + litem.lvalue);
					var cmd = 'docker run -dit -p 0:80 sclyther/' + litem.lvalue;
					exec(cmd, function (error, stdout) {
						if (!error) {
							docker_hash = stdout.match(/[0-9a-f]+/)[0];
							exec('docker port ' + docker_hash, function (error, stdout) {
								if (!error) {
									var docker_port = stdout.match(/\:\d+/)[0];
									WorkshopModule.addNewContainer(new WorkshopModule.DockerContainer(docker_hash, docker_port, source_id, service_url, return_url, consumer_key, uid, lid), function(err, dc){
										WorkshopModule.setContainerTimeout(dc.docker_hash);
										return ((typeof(cb) === 'function') ? cb(null, dc.docker_hash) : dc.docker_hash);
									});
								}
							});
						} else {
							console.log('error:' + error);
						}
					});
				} else {
					console.log('docker creation error');
				}
			});
		},
		setContainerTimeout : function(docker_hash){
			console.log("Timeout for hash: " + docker_hash + " set.");
			setTimeout(function () {
				console.log("Timeout for hash: " +docker_hash + " reached");
				WorkshopModule.destroyContainer(docker_hash);
			}, 1800000);
		},
		destroyContainer: function (docker_hash) {
			var cmd = 'docker stop ' + docker_hash + '&& docker rm ' + docker_hash;
			exec(cmd);
			WorkshopModule.removeContainerByHash(docker_hash);
		},
		checkExistingContainer: function (uid, res, cb) {
			WorkshopModule.findContainerByUid(uid, function(err, citem) {
				if (citem) {
					return ((typeof(cb) === 'function') ? cb(null, citem.docker_hash) : citem.docker_hash);
				} else {
					return ((typeof(cb) === 'function') ? cb(null, false) : false);
				}
			});
		},
		redirectToPort: function (docker_hash, res) {
			WorkshopModule.findContainerByHash(docker_hash, function(err, citem) {
				if (citem) {
					res.writeHead(302, {
						'Location': 'http://' + config.srv_ip + '' + citem.docker_port,
						'Set-Cookie': 'dockerHash=' + citem.docker_hash + '; Path=/;'
					});
					res.end();
				} else {
					res.status(500).send({success: false, error: 'internal Server error'});
				}
			});
		},
		sendSolutionToILIAS : function (service_url, source_id, consumer_key, cb) {
			var provider = new lti.Provider(consumer_key, config.consumer_secret);
			var req = {
				method: 'POST',
				body: {
					ext_outcome_data_values_accepted: 'text,url',
					lis_outcome_service_url: service_url,
					lis_result_sourcedid: source_id,
					lti_message_type: "basic-lti-launch-request",
					lti_version: "LTI-1p0"
				}
			};
			provider.outcome_service.send_replace_result(1., function(err, result){
				console.log("Result send to ILIAS: " + result);
				if(result) return ((typeof(cb) === 'function') ? cb(null, true) : true);
				else return ((typeof(cb) === 'function') ? cb(null, false) : false);
			}.bind(this));
		}
	}
})();

// Define some Framework Stuff
const lti = require('ims-lti');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('./config');
const app = express();

// destroy console.log in live mode
if (!config.inDebug) {
	console = console || {};
	console.log = function(){};
}

// Middleware to parse body
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Middleware to parse Cookies
app.use(cookieParser());

// Register Server on Port
app.listen(config.srv_port, config.srv_ip, function(){
	console.log('Server running at http://'+config.srv_ip+':'+config.srv_port);
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
	if(req.body && req.body.level && req.body.user_id && req.body.launch_presentation_return_url && req.body.lis_outcome_service_url && req.body.launch_presentation_return_url && req.body.oauth_consumer_key) {
		var provider = new lti.Provider(req.body.oauth_consumer_key, config.consumer_secret);
		provider.valid_request(req, function (err, is_valid) {
			// Check if the request is valid and if the outcomes service exists.
			if (!is_valid || !provider.outcome_service) {
				res.status(401).send({success: false, error: 'Unauthorized. Please navigate from ILIAS.'});
				console.log('wrong oauth');
			} else {
				console.log('oauth correct');
				console.log(req.body.lis_result_sourcedid);
				WorkshopModule.checkExistingContainer(req.body.user_id, res, function (error, exists) {
					if (!exists) {
						WorkshopModule.createDockerContainer(req.body.level, req.body.lis_result_sourcedid, req.body.lis_outcome_service_url, req.body.launch_presentation_return_url, req.body.oauth_consumer_key, req.body.user_id, function (err, docker_hash) {
							if (docker_hash) WorkshopModule.redirectToPort(docker_hash, res);
							else res.status(500).send({success: false, error: 'docker creation failed'});
						});
					} else WorkshopModule.redirectToPort(docker_hash, res);
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
                    WorkshopModule.getLevelById(citem.lid, function(err, litem) {
                        WorkshopModule.sendSolutionToILIAS(citem.service_url, citem.source_id, citem.consumer_key, function(err, result) {
                            if(result) {
                                res.status(200).send({success:true, message: 'User: ' + citem.uid + 'hat das Level: ' + litem.lvalue + ' erfolgreich beendet!'});
                                WorkshopModule.removeSecret(req.params.dc_secret);
                            } else {
                                res.status(500).send({success:false, message: 'Internal Error. Could not send solution to ILIAS.'});
                            }
                        });
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
app.delete('/container/:docker_hash/end/secret/:secret', function(req, res){
	WorkshopModule.findContainerByHash(req.params.docker_hash, function(err, citem) {
		WorkshopModule.checkSecretExists(req.params.dc_secret, function(err, secret_exists){
			if(secret_exists) {
				if (citem) {
					WorkshopModule.destroyContainer(req.params.docker_hash);
					res.status(200).send({success: true, return_url: citem.return_url});
				} else {
					res.status(404).send({success: false, error: 'container not found!'});
				}
				res.end();
			} else {
				res.status(401).send({success:false, error: 'Wrong secret!'});
			}
		});
	});
});

// Default Catch for wrong URLs sends 404
app.get('*', function(req, res){
	res.status(404).send({success:false, error:"Ressource not found!"});
	res.end();
});


// Define Levels
WorkshopModule.addNewLevel(new WorkshopModule.Level('ping', 'ilias_cmdi01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('simple_login', 'ilias_sqli01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('error_based_sqli', 'ilias_sqli02'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('blind_sqli', 'ilias_sqli03'));
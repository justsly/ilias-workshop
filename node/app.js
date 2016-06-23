//Workshop Module to keep functions safe

/**
 * WorkshopModule, main Application Object
 *
 * Encapsulates functions to create, prepare and remove docker container. In addition it
 * provides functionality for secure and stable communication from and between ILIAS
 */
var WorkshopModule = (function () {

	//Define child process to handle the Docker environment
	var _exec = require('child_process').exec;
	var _container_list = [];
	var _level_list = [];


	return {


		/**
		 * constructor for Level
		 *
		 * @param lkey String - key to level
		 * @param lvalue String - value of the level
		 * @constructor
		 */
		Level : function (lkey, lvalue) {
			this.lkey = lkey;
			this.lvalue = lvalue;
		},


		/**
		 * adds a new level
		 *
		 * @param litem Object - WorkshopModule.Level
		 */
		addNewLevel : function (litem){
			_level_list.push(litem);
		},

		/**
		 * returns the level by a given id or null
		 *
		 * @param lkey String - key to level
		 * @param cb Function - callback
		 * @returns WorkshopModule.Level|null
		 */
		getLevelById : function (lkey, cb) {
			for (var i = 0; i < _level_list.length; i++) {
				if (_level_list[i].lkey === lkey) {
					return ((typeof(cb) === 'function') ? cb(null, _level_list[i]) : _level_list[i]);
				}
			}

			return ((typeof(cb) === 'function') ? cb(null, null) : null);
		},


        /**
         * constructor for DockerContainer object
         *
         * @param docker_h String - docker hash
         * @param docker_p String - docker port
         * @param source_id Int - ID of the ILIAS Source
         * @param service_url String - URL to send results back to ILIAS
         * @param return_url String - URL to Return to ILIAS
         * @param return_msg String - Message to show to user if mission succesfull solved
         * @param consumer_key String - OAuth consumer key
         * @param uid String - pseudonym user id
         * @param lid String - Level id
         * @param secret String - generate secret
         * @constructor
         */
		DockerContainer : function (docker_h, docker_p, source_id, service_url, return_url, return_msg, consumer_key, uid, lid, secret) {
			this.docker_hash = docker_h;
			this.docker_port = docker_p;
			this.source_id = source_id;
			this.service_url = service_url;
			this.return_url = return_url;
			this.return_msg = return_msg;
			this.consumer_key = consumer_key;
			this.uid = uid;
			this.lid = lid;
			this.secret = secret;
			this.solved = false;
		},


		/**
		 * Push new DockerContainer object to list
		 *
		 * @param dc Object - docker container
		 * @param cb Function - callback
		 * @returns {*}
		 */
		addNewContainer : function (dc, cb) {
			_container_list.push(dc);
			return ((typeof(cb) === 'function') ? cb(null, dc) : dc);
		},


		/**
		 * removes the container by a given id, if matches
		 *
		 * @param docker_hash String - docker hash
		 * @returns {boolean}
		 */
		removeContainerByHash : function (docker_hash) {
			for (var i = 0; i < _container_list.length; i++) {
				if (_container_list[i].docker_hash == docker_hash) {
					_container_list.splice(i, 1);
					return true;
				}
			}

			return false;
		},


		/**
		 * Returns DockerContainer object from list if matches given hash
		 *
		 * @param docker_hash String - docker hash
		 * @param cb Function - callback
		 * @returns {*}
		 */
		findContainerByHash : function (docker_hash, cb) {
			for (var i = 0; i < _container_list.length; i++) {
				if (_container_list[i].docker_hash === docker_hash) {
					return ((typeof(cb) === 'function') ? cb(null, _container_list[i]) : _container_list[i]);
				}
			}

			return ((typeof(cb) === 'function') ? cb(null, null) : null);
		},


		/**
		 * Returns DockerContainer object from list if matches given uid and lid
		 *
		 * @param uid String - pseudonym user id
		 * @param lid String - level id
		 * @param cb Function - callback
		 * @returns {*}
		 */
		findContainerByUid : function (uid, lid, cb) {
			console.log("try to find: " + uid);

			for (var i = 0; i < _container_list.length; i++) {
				if (_container_list[i].uid === uid && _container_list[i].lid === lid) {
					console.log("found " + uid + " at Level " + lid);
					return ((typeof(cb) === 'function') ? cb(null, _container_list[i]) : _container_list[i]);
				}
			}

			return ((typeof(cb) === 'function') ? cb(null, null) : null);
		},


		/**
		 * Create DockerContainer and redirect user to this instance
		 *
		 * @param dockSetup Object - Object to setup a docker container
         * @param cb Function - callback
         */
		createDockerContainer : function (dockSetup, cb) {
			console.log("create Container with key: " + dockSetup.oauth_consumer_key);
			WorkshopModule.getLevelById(dockSetup.level, function(err, litem) {
				if (litem) {
					console.log('level exists: ' + litem.lvalue);

					var cmd = 'docker run -d -p 0:' + config.redirect_port.toString() + ' sclyther/' + litem.lvalue + ' ' + dockSetup.secret;

					_exec(cmd, function (error, stdout) {
						if (!error) {
							docker_hash = stdout.match(/[0-9a-f]+/)[0];
							_exec('docker port ' + docker_hash, function (error, stdout) {
								if (!error) {
									var docker_port = stdout.match(/\:\d+/)[0];

									var con = new WorkshopModule.DockerContainer(
										docker_hash,
										docker_port,
										dockSetup.result_sourcedid,
										dockSetup.outcome_service_url,
										dockSetup.launch_presentation_return_url,
										dockSetup.return_msg,
										dockSetup.oauth_consumer_key,
										dockSetup.user_id,
										dockSetup.level,
										dockSetup.secret
									);

									WorkshopModule.addNewContainer(con, function(err, dc) {
										WorkshopModule.setContainerTimeout(dc.docker_hash, config.container_lifetime);
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


		/**
		 * sets a timeout for the container and removes it if the timeout exceeds
		 *
		 * @param docker_hash String - docker hash
		 * @param ms - milliseconds
		 */
		setContainerTimeout : function(docker_hash, ms) {
			console.log("Timeout for hash: " + docker_hash + " set.");
			setTimeout(function () {
				console.log("Timeout for hash: " +docker_hash + " reached");
				WorkshopModule.destroyContainer(docker_hash);
			}, ms);
		},


		/**
		 * destroys a container
		 *
		 * @param docker_hash String - docker hash
		 */
		destroyContainer : function (docker_hash) {
			console.warn('destroying container with provided hash ' + docker_hash);

			var cmd = 'docker stop ' + docker_hash + '&& docker rm ' + docker_hash;
			_exec(cmd);

			WorkshopModule.removeContainerByHash(docker_hash);
		},


		/**
		 * checks if a given userid and  levelid matches a container
		 *
		 * @param uid String - pseudonym of user id
		 * @param lid String - level id
		 * @param cb Function - callback
		 */
		checkExistingContainer : function (uid, lid, cb) {
			return WorkshopModule.findContainerByUid(uid, lid, function(err, citem) {
				if (citem) {
					return ((typeof(cb) === 'function') ? cb(null, citem) : citem);
				} else {
					return ((typeof(cb) === 'function') ? cb(null, false) : false);
				}
			});
		},


		/**
		 * creates Secret for DockSetup
		 *
		 * @returns md5-hash
         */
		createSecret : function(){
			var current_date = (new Date()).valueOf().toString();
			var random = Math.random().toString();
			// use md5 because its fast and no real security/collision safety is needed
			return crypto.createHash('md5').update(current_date + random).digest('hex');
		},


		/**
		 * builds data for the redirect page, so the user has some feedback while waiting time.
		 *
		 * @param delay_seconds Int - delay in seconds before user gets redirected
		 * @param url String - url of container resource to redirect user to
		 * @param cb Function - callback
         * @returns {string}
         */
		buildRedirectPage: function(delay_seconds, url, cb){
			var data =
				"<!DOCTYPE html>" +
				"<html lang='de'>" +
					"<head>" +
						"<meta charset='utf-8'>" +
						"<title>Redirecting to Container...</title>" +
						"<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
						"<meta name='description' content=''>" +
						"<meta http-equiv='refresh' content='" + delay_seconds + "; url=" + url + "' />" +
						"<link href='../css/style.css' rel='stylesheet'>" +
					"</head>" +
					"<body>" +
						"<div class='container'>" +
							"<p class='text-warning'>Please wait for Container is ready to go. " +
							"You will be redirected to your Container in " + delay_seconds + " seconds...</p>" +
							"<div class='spinner'>" +
								"<div class='cube1'></div>" +
								"<div class='cube2'></div>" +
							"</div>" +
							"<p><small>If your redirect does not work please click <a href='" + url + "'>here</a></small></p>" +
						"</div>" +
					"</body>" +
					"</html>";

			return ((typeof(cb) === 'function') ? cb(null, data) : data);
		},


		/**
		 * redirects the user to a existing container after a specified delay of seconds
		 *
		 * @param docker_hash String - docker hash
		 * @param res Object - HTTP Response Object
         * @param delay_seconds - delay in seconds to redirect to container
         */
		redirectToPort : function (docker_hash, res, delay_seconds) {
			WorkshopModule.findContainerByHash(docker_hash, function(err, citem) {
				if (citem) {
						var url = config.redirect_protocol + '://' + config.redirect_ip + '' + citem.docker_port;

						WorkshopModule.buildRedirectPage(delay_seconds, url, function(err, data){
							res.writeHead(200, {
								'Set-Cookie': 'dockerHash=' + citem.docker_hash + '; Path=/;',
								'Content-Length': data.length,
								'Content-Type': 'text/html'
							});
							res.write(data);
							res.end();
						});

				} else {
					res.status(500).send({success: false, error: 'internal Server error'});
				}
			});
		},


		/**
		 * sends the HMAC-SHA1 signed solution to ilias
		 *
		 * @param service_url String - URL to send results back to ILIAS
		 * @param source_id Int - Source ID of ILIAS
		 * @param consumer_key String - OAuth defiend consumer key
		 * @param cb Function - callback
		 */
		sendSolutionToILIAS : function (service_url, source_id, consumer_key, cb) {
			console.log("send to ILIAS with key: " +consumer_key);

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

			provider.valid_request(req, function (err, is_valid) {
				if (!is_valid || !provider.outcome_service)
					return false;
			});

			provider.outcome_service.send_replace_result(1., function(err, result){
				console.log("Result send to ILIAS: " + result);
				if (result)
					return ((typeof(cb) === 'function') ? cb(null, true) : true);
				else
					return ((typeof(cb) === 'function') ? cb(null, false) : false);
			}.bind(this));
		}
	}
})();



// Define some Framework Stuff
const lti = require('ims-lti');
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const config = require('./config.js');
const app = express();


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

app.use(express.static(__dirname + '/public'));

// Register Server on Port
app.listen(config.srv_port, config.listen_ip, function(){
	console.log('Server running at http://'+config.listen_ip+':'+config.srv_port);
});


/**
 * function to define CORS headers for use in middleware
 * @param req NodeJS Express Request Object
 * @param res NodeJS Express Response Object
 * @param next Next Function Callback
 */
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};


// Middleware to set CORS headers
app.use(allowCrossDomain);


/**
 * checks if request body is valid an returns true or false
 *
 * @param body
 * @returns {boolean}
 */
function isRequestBodyValidForContainerCreate(body) {
	return body
		&& body.level
		&& body.user_id
		//&& body.launch_presentation_return_url
		&& body.lis_outcome_service_url
		&& body.return_msg
		&& body.oauth_consumer_key;
}

/**
 * checks if request body is valid an returns true or false
 *
 * @param body
 * @returns {boolean}
 */
function isRequestBodyValidToComplete(body) {
	return body
		&& body.docker_hash
		&& body.dc_secret;
}


// Method to create Level from ILIAS
app.post('/container/create', function(req, res){
	console.log("POST /container/create called");
	if (isRequestBodyValidForContainerCreate(req.body)) {
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

						var dockSetup = {
							level: req.body.level,
							result_sourcedid: req.body.lis_result_sourcedid,
							outcome_service_url: req.body.lis_outcome_service_url,
							launch_presentation_return_url: req.body.launch_presentation_return_url,
							return_msg: req.body.return_msg,
							oauth_consumer_key: req.body.oauth_consumer_key,
							user_id: req.body.user_id,
							secret: WorkshopModule.createSecret()
						};

						WorkshopModule.createDockerContainer(
							dockSetup,
							function (err, docker_hash) {
								if (docker_hash)
									WorkshopModule.redirectToPort(docker_hash, res, 5);
								else
									res.status(500).send({success: false, error: 'docker creation failed'});
							}
						);
					} else WorkshopModule.redirectToPort(exists.docker_hash, res, 0);
				});
			}
		});
	} else res.status(401).send({success: false, error: 'Unauthorized. Please navigate from ILIAS.'});
});


// Return to ILIAS with complete flag
app.put('/container/complete', function(req, res){
	console.log("PUT /container/create called");
	if (isRequestBodyValidToComplete(req.body)) {
		WorkshopModule.findContainerByHash(req.body.docker_hash, function (err, citem) {
			if (citem && citem.secret == req.body.dc_secret) {
				WorkshopModule.sendSolutionToILIAS(citem.service_url, citem.source_id, citem.consumer_key, function (err, result) {
					if (result) {
						citem.solved = true;
						res.status(200).send({success: true, message: 'Mission solved.'});
						//WorkshopModule.removeSecret(req.params.dc_secret);
					} else {
						res.status(500).send({
							success: false,
							message: 'Internal Error. Could not send solution to ILIAS.'
						});
					}
				});
			} else {
				res.status(404).send({success: false, error: 'container not found or wrong secret!'});
			}
		});
	} else res.status(401).send({success: false, error: 'Unauthorized. Please use provided button to complete your Mission.'});
});


// Define Routing for Container Flush
app.delete('/container/:docker_hash/end', function(req, res){
	WorkshopModule.findContainerByHash(req.params.docker_hash, function(err, citem) {
		if (citem) {
			WorkshopModule.destroyContainer(req.params.docker_hash);
			if(citem.solved) send_msg = citem.return_msg;
			else send_msg = "Container vorzeitig beendet.";
			res.status(200).send({success: true, return_url: citem.return_url, return_msg: send_msg});
		} else {
			res.status(404).send({success: false, error: 'container not found!'});
		}
	});
});


// Default Catch for wrong URLs sends 404
app.get('*', function(req, res){
    res.status(404).send({success:false, error:"Ressource not found!"});
});


// Define Levels
WorkshopModule.addNewLevel(new WorkshopModule.Level('reflected_xss', 'ilias_xss01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('lfi', 'ilias_lfi01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('ping', 'ilias_cmdi01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('simple_login', 'ilias_sqli01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('error_based_sqli', 'ilias_sqli02'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('blind_sqli', 'ilias_sqli03'));
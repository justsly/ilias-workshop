//Workshop Module to keep functions safe
var WorkshopModule = (function () {

	//Define child process to handle the Docker environment
	var exec = require('child_process').exec;
	var container_list = [];
	var level_list = [];

	return {
		Level: function (lkey, lvalue, qid, answer) {
			this.lkey = lkey;
			this.lvalue = lvalue;
			this.qid = qid;
			this.answer = answer;
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
		//Define object DockerContainer
		DockerContainer: function (docker_h, docker_p, active_id, uid, lid) {
			this.docker_hash = docker_h;
			this.docker_port = docker_p;
			this.active_id = active_id;
			this.uid = uid;
			this.lid = lid;
		},
		//Push new DockerContainer object to list
		addNewContainer: function (dc) {
			container_list.push(dc);
		},
		//Remove DockerContainer object from list if matches given hash
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
		//Create DockerContainer and redirect User to this Instance
		createDockerContainer: function (lid, active_id, uid, res) {
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
									WorkshopModule.addNewContainer(new WorkshopModule.DockerContainer(docker_hash, docker_port, active_id, uid, lid));
									setTimeout(function () {
										res.writeHead(302, {
											'Location': 'http://' + config.srv_ip + '' + docker_port,
											'Set-Cookie': ['dockerHash=' + docker_hash + '; Path=/;']
										});
										res.end();
										setTimeout(function () {
											WorkshopModule.destroyContainer(docker_hash);
										}, 1800000);
									}, 3000);
								}
							});
						} else {
							console.log('error:' + error);
							res.status(500).send({success: false, error: error});
						}
					});
				} else {
					console.log('docker creation error');
					res.status(500).send({success: false, error: 'docker creation failed'});
				}
			});
		},
		destroyContainer: function (docker_hash) {
			var cmd = 'docker stop ' + docker_hash + '&& docker rm ' + docker_hash;
			exec(cmd);
			WorkshopModule.removeContainerByHash(docker_hash);
		},
		checkExistingContainer: function (req, res, cb) {
			if (req.cookies) var docker_hash = req.cookies['dockerHash'];
			WorkshopModule.findContainerByHash(docker_hash, function(err, citem) {
				if (citem) {
					WorkshopModule.redirectToPort(citem.docker_port, res);
					return ((typeof(cb) === 'function') ? cb(null, true) : true);
				} else {
					return ((typeof(cb) === 'function') ? cb(null, false) : false);
				}
			});
		},
		redirectToPort: function (docker_port, res) {
			res.writeHead(302, {
				'Location': 'http://' + config.srv_ip + '' + docker_port
			});
			res.end();
		},
        //SOAP Call to check if uid is valid in ILIAS
        checkValidSid : function (uid, cb) {
			var args = {sid: uid + '::ilias'};
			soap.createClient(config.wsdl_url, function(err, client) {
				client.getUserIdBySid(args, function(err, result) {
					if(result.usr_id){
						return ((typeof(cb) === 'function') ? cb(null, true) : true);
					} else {
						return ((typeof(cb) === 'function') ? cb(null, false) : false);
					}
				});
			}.bind(this));
        },
		sendSolutionToILIAS : function (answer, uid, aid, qid, cb) {
			console.log("try to send answer: " + answer);
			var sol = "<values><value>" + answer + "</value><value></value><points>5</points></values>";
			var args = {sid: uid + '::ilias', active_id: aid, question_id: qid, pass: 0, solution: sol};
			soap.createClient(config.wsdl_url, function(err, client) {
				client.saveQuestionSolution(args, function(err, result) {
					if(result.html) {
						console.log(result);
						return ((typeof(cb) === 'function') ? cb(null, true) : true);
					} else {
						console.log("answer not ok");
						return ((typeof(cb) === 'function') ? cb(null, false) : false);
					}
				})
			}.bind(this));
		}
	}
})();

//Define some Framework Stuff
const soap = require('soap');
const express = require('express');
const cookieParser = require('cookie-parser');
const config = require('./config');
const app = express();

// destroy console.log in live mode
if (!config.inDebug) {
	console = console || {};
	console.log = function(){};
}


app.use(cookieParser());

//Register Server on Port
app.listen(config.srv_port, config.srv_ip, function(){
	console.log('Server running at http://'+config.srv_ip+':'+config.srv_port);
});

//Set CORS Definition here
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};
app.use(allowCrossDomain);

app.use(function(req, res, next){
	WorkshopModule.checkExistingContainer(req, res, function(err, exists) {
		if(!exists) next();
	});
});

//Define Routing for the Websecurity Levels
app.get('/container/create/:level_id/active_id/:active_id/uid/:uid', function(req, res){
	WorkshopModule.checkValidSid(req.params.uid, function(err, isvalid) {
		console.log("valid uid: " + isvalid);
		if(isvalid) {
			WorkshopModule.createDockerContainer(req.params.level_id, req.params.active_id, req.params.uid, res);
		} else {
			return res.status(401).send({success: false, error: 'denying docker creation because of missing sid / level'});
		}
	});
});

// Return to ILIAS with complete flag
app.get('/container/:docker_hash/complete', function(req, res){
	WorkshopModule.findContainerByHash(req.params.docker_hash, function(err, citem) {
		if(citem){
			WorkshopModule.getLevelById(citem.lid, function(err, litem) {
				WorkshopModule.sendSolutionToILIAS(litem.answer, citem.uid, citem.active_id, litem.qid, function(err, result) {
					if(result) {
						res.status(200).send({success:true, message: 'User: ' + citem.active_id + 'hat das Level: ' + litem.lvalue + ' erfolgreich beendet!'});
					} else {
						res.status(500).send({success:false, message: 'Internal Error. Could not send solution to ILIAS.'});
					}
				});
			});
		} else {
			res.status(404).send({success:false, error: 'container not found!'});
		}
	});
});

//Define Routing for Container Flush
app.delete('/container/:docker_hash/end', function(req, res){
	WorkshopModule.findContainerByHash(req.params.docker_hash, function(err, citem) {
		if(citem){
			WorkshopModule.destroyContainer(req.params.docker_hash);
			res.status(200).send({success:true});
		} else {
			res.status(404).send({success:false, error: 'container not found!'});
		}
		res.end();
	});
});

//Default Catch for wrong URLs sends 404
app.get('*', function(req, res){
	res.status(404).send({success:false, error:"Ressource not found!"});
	res.end();
});


//Define Levels
WorkshopModule.addNewLevel(new WorkshopModule.Level('base', 'bb_ws_base_image', 1, 'base1'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('cmdi01', 'bb_ws_cmdi_01', 1, 'cmdi1'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('ping', 'ilias_cmdi01', 2, '2e78cabf229b96c729960d05b7bac509'));


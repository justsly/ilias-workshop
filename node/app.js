//Workshop Module to keep functions safe
var WorkshopModule = (function () {

	//Define child process to handle the Docker environment
	var exec = require('child_process').exec;
	var container_list = [];
	var level_list = [];

	return {
		Level: function (lkey, lvalue) {
			this.lkey = lkey;
			this.lvalue = lvalue;
		},
		addNewLevel : function (litem){
			level_list.push(litem);
		},
		getLevelById: function (lkey) {
			for (var i = 0; i < level_list.length; i++) {
				if (level_list[i].lkey === lkey) {
					return level_list[i].lvalue;
				}
			}
			return null;
		},
		//Define object DockerContainer
		DockerContainer: function (docker_h, docker_p) {
			this.docker_hash = docker_h;
			this.docker_port = docker_p;
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
		findContainerByHash: function (docker_hash) {
			for (var i = 0; i < container_list.length; i++) {
				if (container_list[i].docker_hash === docker_hash) {
					return container_list[i].docker_port;
				}
			}
			return null;
		},
		//Create DockerContainer and redirect User to this Instance
		createDockerContainer: function (lvalue, ref_id, page_id, res) {
			var cmd = 'docker run -dit -p 0:80 sclyther/' + lvalue;
			exec(cmd, function (error, stdout, stderr) {
				if (!error) {
					docker_hash = stdout.match(/[0-9a-f]+/)[0];
					exec('docker port ' + docker_hash, function (error, stdout, stderr) {
						if (!error) {
							var docker_port = stdout.match(/\:\d+/)[0];
							WorkshopModule.addNewContainer(new WorkshopModule.DockerContainer(docker_hash, docker_port));
							setTimeout(function () {
								res.writeHead(302, {
									'Location': 'http://' + srv_ip + '' + docker_port,
									'Set-Cookie': ['dockerHash=' + docker_hash + '; Path=/;', 'ref_id=' + ref_id + '; Path=/;', 'page_id=' + page_id + ';Path=/']
								});
								res.end();
								setTimeout(function () {
									WorkshopModule.destroyContainer(docker_hash);
								}, 1800000);
							}, 3000);
						}
					});
				} else {
					console.log('docker creation error', error);
					res.status(500).send({success: false, error: 'docker creation failed'});
				}
			});
		},
		destroyContainer: function (docker_hash) {
			var cmd = 'docker stop ' + docker_hash + '&& docker rm ' + docker_hash;
			exec(cmd);
			WorkshopModule.removeContainerByHash(docker_hash);
		},
		checkExistingContainer: function (req, res) {
			if (req.cookies) var docker_hash = req.cookies['dockerHash'];
			var docker_port = WorkshopModule.findContainerByHash(docker_hash);
			if (docker_port) {
				WorkshopModule.redirectToPort(docker_port, res);
				return true;
			} else {
				return false;
			}
		},
		redirectToPort: function (docker_port, res) {
			res.writeHead(302, {
				'Location': 'http://' + srv_ip + '' + docker_port
			});
			res.end();
		},
        //@todo fix this with correct soap call
        checkValidSid : function (uid) {
			var url = 'https://ilias.slycurity.de/webservice/soap/server.php?wsdl';
			var args = {sid: uid + '::ilias'};
			soap.createClient(url, function(err, client) {
				client.getUserIdBySid(args, function(err, result) {
					if(result.usr_id){
						console.log('in function: ' + result.usr_id);
						return true;
					} else {
						return false;
					}
				});
			});
        }
	}
})();

//Define some Framework Stuff
const soap = require('soap');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

// Define Server IP and Port
const srv_ip = '192.168.56.101';
const srv_port = 8080;

//Register Server on Port
app.listen(srv_port, srv_ip, function(){
	console.log('Server running at http://'+srv_ip+':'+srv_port);
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
	var exists = WorkshopModule.checkExistingContainer(req, res);
	if(!exists) next();
});

//Define Routing for the Websecurity Levels
app.get('/container/create/:level_id/ref_id/:ref_id/page_id/:page_id/uid/:uid', function(req, res){
	var level = WorkshopModule.getLevelById(req.params.level_id);
	var isvalid = WorkshopModule.checkValidSid(req.params.uid);
    console.log("outside function: " + isvalid);
	if(level){
		WorkshopModule.createDockerContainer(level, req.params.ref_id, req.params.page_id, res);
	}
});

// Return to ILIAS with complete flag
app.get('/container/:docker_hash/complete', function(req, res){
	var container_item = WorkshopModule.findContainerByHash(req.params.docker_hash);
	if(container_item){
		res.status(200).send({success:true, message: 'User: ' + container_item.uid + 'hat das Level erfolgreich beendet!'})
	} else {
		res.status(500).send({success:false, error: 'container not found!'});
	}
});

//Define Routing for Container Flush
app.delete('/container/:docker_hash/end', function(req, res){
	WorkshopModule.destroyContainer(req.params.docker_hash);
	res.status(200).send({success:true});
	res.end();
});

//Check if Level Exists
app.get('/level/:level_id/exists/', function(req, res){
	if(req.params.level_id){
		var exists = WorkshopModule.getLevelById(req.params.level_id);
		if(!exists){
			res.status(404).send({success:false, error:"Level does not exist!"});
            res.end();
		} else {
			res.status(200).send({success:true});
            res.end();
		}
	}
});

//Default Catch for wrong URLs sends 404
app.get('*', function(req, res){
	res.status(404).send({success:false, error:"Container not found!"});
	res.end();
});


//Define Levels
WorkshopModule.addNewLevel(new WorkshopModule.Level('base', 'bb_ws_base_image'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('cmdi01', 'bb_ws_cmdi_01'));
WorkshopModule.addNewLevel(new WorkshopModule.Level('ping', 'ilias_cmdi01'));


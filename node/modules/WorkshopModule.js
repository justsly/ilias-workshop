//Workshop Module to keep functions safe

var WorkshopModule = (function () {

    //Define child process to handle the Docker environment
    var _exec = require('child_process').exec;
    var _container_list = [];
    var _level_list = [];
    var _secret_list = [];

    return {


        /**
         * constructor for Level
         *
         * @param lkey
         * @param lvalue
         * @constructor
         */
        Level : function (lkey, lvalue) {
            this.lkey = lkey;
            this.lvalue = lvalue;
        },


        /**
         * adds a new level
         *
         * @param litem
         */
        addNewLevel : function (litem){
            _level_list.push(litem);
        },


        /**
         * returns the level by a given id orn ull
         *
         * @param lkey
         * @param cb
         * @returns {*}
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
         * adds a secret to the secret list
         *
         * @param dc_secret
         */
        addSecret : function(dc_secret){
            _secret_list.push(dc_secret);
        },


        /**
         * checks if a given secret exists and returns true or false
         *
         * @param dc_secret
         * @param cb
         * @returns {boolean}
         */
        checkSecretExists : function(dc_secret, cb) {
            for (var i = 0; i < _secret_list.length; i++) {
                if (_secret_list[i] == dc_secret){
                    return ((typeof(cb) === 'function') ? cb(null, true) : true);
                }
            }

            return ((typeof(cb) === 'function') ? cb(null, false) : false);
        },


        /**
         * Remove Secret from list if matches
         *
         * @param dc_secret
         * @returns {boolean}
         */
        removeSecret : function (dc_secret) {
            for (var i = 0; i < _container_list.length; i++) {
                if (_secret_list[i] == dc_secret) {
                    _secret_list.splice(i, 1);
                    return true;
                }
            }

            return false;
        },


        /**
         * constructor for DockerContainer object
         *
         * @param docker_h
         * @param docker_p
         * @param source_id
         * @param service_url
         * @param return_url
         * @param consumer_key
         * @param uid
         * @param lid
         * @constructor
         */
        DockerContainer : function (docker_h, docker_p, source_id, service_url, return_url, consumer_key, uid, lid) {
            this.docker_hash = docker_h;
            this.docker_port = docker_p;
            this.source_id = source_id;
            this.service_url = service_url;
            this.return_url = return_url;
            this.consumer_key = consumer_key;
            this.uid = uid;
            this.lid = lid;
        },


        /**
         * Push new DockerContainer object to list
         *
         * @param dc
         * @param cb
         * @returns {*}
         */
        addNewContainer : function (dc, cb) {
            _container_list.push(dc);
            return ((typeof(cb) === 'function') ? cb(null, dc) : dc);
        },


        /**
         * removes the container by a given id, if matches
         *
         * @param docker_hash
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
         * @param docker_hash
         * @param cb
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
         * @param uid - userid
         * @param lid - levelid
         * @param cb
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
         * @param lid
         * @param source_id
         * @param service_url
         * @param return_url
         * @param consumer_key
         * @param uid
         * @param cb
         */
        createDockerContainer : function (lid, source_id, service_url, return_url, consumer_key, uid, cb) {
            console.log("create Container with key: " +consumer_key);
            WorkshopModule.getLevelById(lid, function(err, litem) {
                if (litem) {
                    console.log('level exists: ' + litem.lvalue);

                    var cmd = 'docker run -dit -p 0:' + config.redirect_port.toString() + ' sclyther/' + litem.lvalue;

                    _exec(cmd, function (error, stdout) {
                        if (!error) {
                            docker_hash = stdout.match(/[0-9a-f]+/)[0];
                            _exec('docker port ' + docker_hash, function (error, stdout) {
                                if (!error) {
                                    var docker_port = stdout.match(/\:\d+/)[0];

                                    var con = new WorkshopModule.DockerContainer(
                                        docker_hash,
                                        docker_port,
                                        source_id,
                                        service_url,
                                        return_url,
                                        consumer_key,
                                        uid,
                                        lid
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
         * @param docker_hash
         * @param ms
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
         * @param docker_hash
         */
        destroyContainer : function (docker_hash) {
            console.warn('destroying container with provided hash ' + docker_hash + ' assuming given docker container exists.');

            var cmd = 'docker stop ' + docker_hash + '&& docker rm ' + docker_hash;
            _exec(cmd);

            WorkshopModule.removeContainerByHash(docker_hash);
        },


        /**
         * checks if a given userid and  levelid matches a container
         *
         * @param uid
         * @param lid
         * @param cb
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
         * redirects the user to a container
         *
         * @param docker_hash
         * @param res
         */
        redirectToPort : function (docker_hash, res) {
            WorkshopModule.findContainerByHash(docker_hash, function(err, citem) {
                if (citem) {
                    res.writeHead(302, {
                        'Location': config.redirect_protocol + '://' + config.redirect_ip + '' + citem.docker_port,
                        'Set-Cookie': 'dockerHash=' + citem.docker_hash + '; Path=/;'
                    });
                    res.end();
                } else {
                    res.status(500).send({success: false, error: 'internal Server error'});
                }
            });
        },


        /**
         * sends the solution to ilias
         *
         * @param service_url
         * @param source_id
         * @param consumer_key
         * @param cb
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


module.exports = WorkshopModule;
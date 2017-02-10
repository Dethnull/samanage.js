"use strict";

let version = '0.0.1';

let bunyan = require('bunyan');

let httperrors = require('../http-errors.js');
let logstream = require('../logstream');

let logger  = bunyan.createLogger({
    name: 'incidents.js v' + version,
    streams: [{
        type: "rotating-file",
        path: "logs/incidents.js.log",
        period: "1d",
        level: "debug"
    },{
        type: "raw",
        stream: logstream,
        level: "info"
    }]
});


let incidents = function (options, auth) {

    if (options) this.options().set(options);
    if (auth) this.auth().set(auth);

    // The call to _api has to be cloned in order to prevent overwriting configurations for other parts of Samanage calls
    let my  = this,
        api = this._api.createClone();

    api.url.type = "incidents";
    
    let request = my._request.defaults({
        baseUrl: my._buildURL(api),
        method: "GET"
    });
    
    
    /**
     *
     * @returns {Promise}
     */
    let create = function () {
        request = request.defaults({"method": "POST", "Content-Type": "application/json"});
        return new Promise(function(resolve, reject) {

        });
    };
    
    /**
     *
     * @param id
     * @param query
     * @returns {Promise}
     */
    let get = function (id) {
        request = request.defaults({"method": "GET"});
        return new Promise(function(resolve, reject) {

            request(id + '.json', function(err, res, body) {
                if (err) logger.error(err) && process.exit(1);
                resolve([res, body]);
            })
        });
    };
    
    
    
    /**
     *
     * @param id
     * @returns {Promise}
     */
    let search = function() {
    
    };
    
    
    /**
     *
     * @param id
     * @returns {Promise}
     */
    let update = function (id) {
        request = request.defaults({"method": "PUT", "Content-Type": "application/json"});
        return new Promise(function(resolve, reject) {
            
        });
    };
    
    /**
     *
     * @param id
     * @returns {Promise}
     */
    let remove = function (id) {
        request = request.defaults({"method": "DELETE"});
        return new Promise(function(resolve, reject) {

        });
    };
    
    return {
        create: create,
        get:    get,
        remove: remove,
        search: search,
        update: update
    }
};


module.exports = incidents;

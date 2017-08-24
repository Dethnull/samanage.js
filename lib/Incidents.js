"use strict";

let version = '0.0.1';

let bunyan = require('bunyan');

let httperrors = require('../http-errors.js');
let logstream = require('../logstream');

let logger  = bunyan.createLogger({
    name: 'incidents.js v' + version,
    streams: [{
        type: "rotating-file",
        path: "./logs/incidents.log",
        period: "1d",
        level: "debug"
    },{
        type: "raw",
        stream: logstream,
        level: "info"
    }]
});


let incidents = function (options, auth) {

    if (options) { this.config(options); }
    if (auth)    { this.auth(auth); }

    let self    = this;
    let api     = JSON.parse(JSON.stringify(this._api)); // Create a local clone of the _api so we don't change the global

    api.url.type = "incidents";
    
    let request = self._request.defaults({
        baseUrl: self._buildURL(api),
        method: "GET"
    });
    
    
    /**
     * Create a new incident in Samanage. It's best to use the IncidentTemplate object to create these ticket. You can
     * still pass a normal object yourself of course, but you'll have to pass the correct values, which the helper object
     * does for you.
     *
     * @param {Object} incidentTemplate This should be passed an object created from IncidentTemplate.
     * @param {Boolean} retry Force the method to resubmit the request if receive a 503 error, which Samanage will send during rate limiting
     * @param {number} attempt The current attempt number. Used only when a 503 status code was found
     * @param {number} waitTime The amount of time to wait until the request is attempted again
     * @returns {Promise}
     */
    let create = function (incidentTemplate, retry, attempt, waitTime) {

        attempt = attempt || 0;

        request = request.defaults({
            method: "POST",
            "Content-Type": "application/json",
            baseUrl: self._buildURL()+".json"
        });

        return new Promise(function(resolve, reject) {
            request("", {body: incidentTemplate }, function(err, res, body) {
                if (err) logger.error(err) && reject(err);

                if (res.statusCode === 503) {
                    if (retry && attempt <= 3) {
                        attempt++;
                        setInterval(function() {
                            return create(incidentTemplate, true, attempt, waitTime)
                        }, waitTime || self._options.waitTime);
                    } else {
                        logger.error("Exceeded number of retry attempts", incidentTemplate);
                        reject({
                            res: res,
                            body: self.utils.checkErrorCodes(res)
                        });
                    }
                } else if (res.statusCode === 200) {
                    resolve({res: res, body: body});
                } else {
                    reject({
                        res: res,
                        body: self.utils.checkErrorCodes(res)
                    });
                }
            });
        });
    };

    let comments = self.comments(api.url.type);

    /**
     * GET incident using ID
     *
     * @param {number} id ID of incident
     * @param {object} options Additional arguments to pass to the request
     * @returns {Promise} object Returns the full http response and a quick access to body { res, body }
     */
    let get = function (id, options) {
        request = request.defaults({
            method: "GET",
            useQuerystring: (!!options),
            qs: options,
            baseUr: self._buildURL()
        });

        return new Promise(function(resolve, reject) {
            request(`${id}.json`, function(err, res, body) {
                if (err) logger.error(err) && reject(err);

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject({
                        res: res,
                        body: self.utils.checkErrorCodes(res)
                    });
                } else {
                    resolve({res: res, body: body});
                }
            })
        }).catch(function(err) {
            logger.error(err.body);
        });
    };

    /**
     * Search incidents and return results.
     *
     *
     * @returns {Promise} object Returns { res, body, page {object} }
     *
     * @param {object} options Search config as an object. Key: Value needs to be a searchable term in Samanage
     * @param {string} options Options can be a URL string from Samanage, it wll create the object needed to be searchable
     * @param {number} page The page number to get
     */
    let search = function(options, page) {

        // This allows us to use search strings directly from the URL bar in Samanage.
        if (typeof options === "string") options = createSearchObject(options);

        if (page) options["page"] = page;

        request = request.defaults({
            method: "GET",
            useQuerystring: (!!options),
            qs: options,
            baseUrl: self._buildURL()+".json"
        });

        return new Promise(function(resolve, reject) {
            request("", function(err, res, body) {
                if (err) logger.error(err) && reject(err);

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject({
                        res: res,
                        body: self.utils.checkErrorCodes(res)
                    });
                } else {
                    resolve({
                        res: res, body: body,
                        page: {
                            current:    res.headers["x-current-page"],
                            perPage:    res.headers["x-per-page"    ],
                            totalPages: res.headers["x-total-pages" ],
                            totalCount: res.headers["x-total-count" ]
                        }
                    });
                }
            })
        })
    };

    /**
     *  Takes a query string or URL directly from Samanage and converts it to an object. This object can then be used
     * with the 'qs' option for request. incidents.search() calls this function if 'config' is a string.
     *
     * @param {String} qString query string to convert to an object for searching
     * @returns {Object}
     */
    let createSearchObject = function(qString) {

        let y = qString.split("?");

        if (y.length > 1) qString = y[1];

        let x = decodeURIComponent(qString).split("&").filter(Boolean);

        let len = x.length;
        let out = { };

        for (let i = 0; i < len; i++) {
            let curs = x[i].split("=");

            if (out[curs[0]]) {
                out[curs[0]].push(curs[1]);
            } else {
                out[curs[0]] = [curs[1]];
            }
        }

        return out;
    };

    /**
     *
     * @param {number} id
     * @param {object} options Should be at least an object with state_id: "", resolution: "" passed. Or use IncidentTemplate
     * @returns {Promise}
     */
    let update = function (id, options) {

        request = request.defaults({
            method: "PUT",
            "Content-Type": "application/json",
            baseUrl: self._buildURL()
        });

        return new Promise(function(resolve, reject) {

            if (!options) {
                logger.error("config must be passed to update.");
                reject();
            }

            if (!options.incident) {
                options = { incident: options }
            }



            request(`${id}.json`, { body: options }, function(err, res, body) {
                if (err) logger.error(err) && reject(err);

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject({
                        res: res,
                        body: self.utils.checkErrorCodes(res)
                    });
                } else {
                    resolve({res: res, body: body,});
                }
            });
        });
    };

    /**
     *
     * @param id
     * @returns {Promise}
     */
    let remove = function (id) {
        request = request.defaults({
            "method": "DELETE",
            baseUrl: self._buildURL()
        });

        return new Promise(function(resolve, reject) {
            request(`${id}.json`, function(err, res, body) {
                if (err) logger.error(err) && reject(err);

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject({
                        res: res,
                        body: self.utils.checkErrorCodes(res)
                    });
                } else {
                    resolve({res: res, body: body,});
                }
            })
        });
    };



    return {
        comments: comments,
        create: create,
        get:    get,
        remove: remove,
        search: search,
        createSearchObject: createSearchObject,
        update: update
    }
};


module.exports = incidents;

"use strict";

let version = '0.0.1';

let bunyan = require('bunyan');
let logstream = require('../logstream');
let path = require('path');

let logger  = bunyan.createLogger({
    name: 'incidents.js v' + version,
    streams: [{
        path: path.join(__dirname, "/../logs/incidents.log"),
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
     * Create a new incident in Samanage. It's best to use the MessageTemplate object to create these ticket. You can
     * still pass a normal object yourself of course, but you'll have to pass the correct values, which the helper object
     * does for you.
     *
     * This method also attempts to account for Samanage rate limiting. In the even of a 503 status code or the resulting
     * ticket ID being undefined or null, this method will attempt up to "attempt" number of times. This assumes you haven't
     * changed the default samanage.config("incidentRetry") to false or manually passed false to the method.
     *
     * @param {MessageTemplate} messageTemplate This should be passed an object created from MessageTemplate.
     * @param {Boolean} retry Force the method to resubmit the request if receive a 503 error, which Samanage will send during rate limiting
     * @param {number} attempt The current attempt number. Used only when a 503 status code was found or a null ticket, Note you shouldn't set this yourself, the method will pass the correct value in its place
     * @param {number} waitTime The amount of time to wait until the request is attempted again
     * @returns {Promise}
     */
    let create = function (messageTemplate, retry, attempt, waitTime) {

        attempt = attempt || 0;
        retry = retry || self.config("incidentRetry");
        waitTime = waitTime || self.config("waitTime");

        request = request.defaults({
            method: "POST",
            "Content-Type": "application/json",
            baseUrl: self._buildURL()+".json?add_callbacks="+self.config("sendEmail")
        });

        return new Promise(function(resolve, reject) {
            request("", {body: messageTemplate }, function(err, res, body) {
                if (err) { logger.error(err); reject(err) }

                // 503 code is sent during rate limiting
                // We also want to retry in the event of a null ticket being created. I.E. ID is not defined/null
                if (res.statusCode === 503 || body.id === undefined || body.id === null) {
                    if (retry && attempt <= 3) {
                        logger.debug("503 status or null ID identified. Retrying... " + attempt);
                        setInterval(function() {
                            return create(messageTemplate, true, attempt++, waitTime)
                        }, waitTime);
                    } else {
                        logger.error("Exceeded number of retry attempts", messageTemplate);
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
            baseUrl: self._buildURL()
        });

        return new Promise(function(resolve, reject) {
            request(`${id}.json`, function(err, res, body) {
                if (err) { logger.error(err); reject(err) }

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
        if (typeof options === "string") options = self.createSearchObject(options);

        if (page) options["page"] = page;

        request = request.defaults({
            method: "GET",
            useQuerystring: (!!options),
            qs: options,
            baseUrl: self._buildURL()+".json"
        });

        return new Promise(function(resolve, reject) {
            request("", function(err, res, body) {
                if (err) { logger.error(err); reject(err) }

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
     *
     * @param {number} id
     * @param {object} options Should be at least an object with state_id: "", resolution: "" passed. Or use MessageTemplate
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

            request(`${id}.json?add_callbacks=${self.config("sendEmail")}`, { body: options }, function(err, res, body) {
                if (err) { logger.error(err); reject(err) }

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
                if (err) { logger.error(err); reject(err) }

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
        update: update
    }
};

module.exports = incidents;

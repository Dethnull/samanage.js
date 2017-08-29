"use strict";

let bunyan = require('bunyan');
let logstream = require('../logstream');

let version = '0.0.1';

let logger  = bunyan.createLogger({
    name: 'solutions.js v' + version,
    streams: [{
        path: "./logs/solutions.log",
        level: "debug"
    },{
        type: "raw",
        stream: logstream,
        level: "info"
    }]
});


let solutions = function() {

    let self    = this;
    let api     = JSON.parse(JSON.stringify(this._api)); // Create a local clone of the _api so we don't change the global

    api.url.type = "solutions";

    let request = self._request.defaults({
        baseUrl: self._buildURL(api),
        method: "GET"
    });

    /**
     * @description Create a new solution. Best to use the SolutionTemplate in the lib folder to easily create this request
     * as it will add the correct JSON arguments to the request.
     *
     * @param {MessageTemplate} messageTemplate
     */
    let create = function(messageTemplate) {
        request = request.defaults({
            method: "POST",
            baseUrl: self._buildURL(api)+'.json',
            "Content-Type": "application/json"
        });

        return new Promise(function(resolve, reject) {
            request("", { body: messageTemplate }, function(err, res, body) {
                if (err) { logger.error(err); reject(err) }

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject({
                        res: res,
                        body: self.utils.checkErrorCodes(res)
                    });
                } else {
                    resolve({res: res, body: body});
                }
            });
        });
    };

    let remove = function(id) {
        request = request.defaults({
            method: "DELETE",
            baseUrl: self._buildURL(api),
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
            });
        });
    };

    let update = function(id, options) {
        // Doesn't work?
    };

    let get = function(id) {
        request = request.defaults({
            method: "GET",
            baseUrl: self._buildURL(api)
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
            });
        });
    };

    let search = function(options, page) {
        // This allows us to use search strings directly from the URL bar in Samanage.
        if (typeof options === "string") { options = self.createSearchObject(options); }

        if (page) { options["page"] = page; }

        request = request.defaults({
            method: "GET",
            useQuerystring: (!!options),
            qs: options,
            baseUrl: self._buildURL(api)+".json"
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

    return {
        create: create,
        remove: remove,
        update: update,
        search: search,
        get: get
    }
};

module.exports = solutions;
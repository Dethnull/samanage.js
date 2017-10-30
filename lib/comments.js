"use strict";

let version = "0.0.1";

let bunyan = require('bunyan');
let logstream = require('../logstream');
let path = require('path');

let logger  = bunyan.createLogger({
    name: 'comments.js v' + version,
    streams: [{
        type: "rotating-file",
        path: path.join(__dirname, "/../logs/comments.log"),
        period: "1d",
        level: "debug"
    },{
        type: "raw",
        stream: logstream,
        level: "info"
    }]
});

let logError = function(err) { logger.error(err); };

let comments = function(type) {
    let self = this; //references Samanage object

    let api = self._api;
    api.url.type = type;

    let request = self._request.defaults({
        baseUrl: self._buildURL(api),
        method: "GET"
    });

    let post = function(id, message, isPrivate, commenter) {
        request = request.defaults({
            method: "POST",
            json: true
        });

        let comment = {
            body: message,
            "is_private": (!!isPrivate)
        };

        if (commenter) { comment["commenter"] = commenter; }

        return new Promise(function(resolve, reject) {
            request(`/${id}/comments.json?add_callbacks=${self.config("sendEmail")}`, {body: {comment: comment}}, function(err, res, body) {
               if (err) { logger.error(err); reject(err) }

               if (res.statusCode < 200 || res.statusCode >= 300) {
                   reject({
                       res: res,
                       body: self.utils.checkErrorCodes(res)
                   });
               } else {
                   resolve({res: res, body: body})
               }
            });
        }).catch(logError);
    };

    let get = function(id, options) {
        request = request.defaults({
            method: "GET",
            useQuerystring: (!!options),
            qs: options
        });
        return new Promise(function(resolve, reject) {
            request(`/${id}/comments.json`,function(err, res, body) {
                if (err) logger.error(err) && reject(err);

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject({res: res, body: self.utils.checkErrorCodes(res)});
                } else {
                    resolve({res: res, body: body});
                }
            })
        }).catch(logError);
    };

    let remove = function(incidentID, commentID) {
        request = request.defaults({method: "DELETE"});

        return new Promise(function(resolve, reject) {
            request(`/${incidentID}/comments/${commentID}.json`, function(err, res, body) {
               if (err) logger.error(err) && reject(err);

                if (res.statusCode < 200 || res.statusCode >= 300) {
                    reject({res: res, body: self.utils.checkErrorCodes(res)});
                } else {
                    resolve({res: res, body: body});
                }
            });
        }).catch(logError);
    };

    return {
        post: post,
        get: get,
        remove: remove
    }


};

module.exports = comments;
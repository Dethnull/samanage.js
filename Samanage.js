"use strict";

let smConfig = require(__dirname + '/package.json');

let bunyan  = require('bunyan');
let request = require('request');
let path = require('path');
let logstream = require('./logstream');

let logger  = bunyan.createLogger({
    name: 'Samanage.js v' + smConfig.version,
    streams: [{
        path: path.join(__dirname, "/logs/Samanage.js.log"),
        level: "debug"
    },{
        type: "raw",
        stream: logstream,
        level: "info"
    }]
});


let Samanage = function (config) {
    this._verbose   = 0;
    //this._debug     = config.debug || 0;
    
    this._api = {
        version: [
            'application/vnd.samanage.v1.1+json',
            'application/vnd.samanage.v1.2+json',
            'application/vnd.samanage.v1.3+json',
            'application/vnd.samanage.v2.1+json'
        ],
        header: { accept: 'application/vnd.samanage.v2.1+json' }, // Use latest version by default.
        url:    {
            app:  (config && config.app) ? config.app : 'api', // Default to api, settable to owned application name
            base: 'samanage.com',
            type: null
        }
    };

    this._options = {
        waitTime:   (config && config.waitTime)   ? config.waitTime      : 5000,
        sendEmail:  (config && config.sendEmail)  ? config.sendEmail     : true,
        layout:     (config && config.layout)     ? config.layout        : "long",
        stateID: {
            "resolved":       (config && config.stateID.resolved)       ? config.stateID.resolved        : '',
            "assigned":       (config && config.stateID.assigned)       ? config.stateID.assigned        : '',
            "awaiting_input": (config && config.stateID.awaiting_input) ? config.stateID.awaiting_input  : '',
            "on_hold":        (config && config.stateID.on_hold)        ? config.stateID.on_hold         : '',
            "new":            (config && config.stateID["new"])         ? config.stateID["new"]          : ''
        },
        template: {
            solution: "solution",
            incident: "incident"
        }
    };

    this._auth = null;

    this._buildURL = function (localApi) {
        let url = (localApi || this._api).url;

        return "https://" + url.app + "." + url.base + (url.type ? '/' + url.type : '');
    };


    this._request = request.defaults({
        baseUrl: this._buildURL(),
        headers: {
            accept: this._api.header.accept
        },
        json: true
    });
};

Samanage.prototype.auth = function(auth) {

    let self = this;

    if ((auth.username && auth.password)) {
         self._request = self._request.defaults({
            auth: { auth }
        });
    }  else if (auth.bearer) {
        self._request = self._request.defaults({
            headers: {
                "X-Samanage-Authorization": "Bearer "+auth.bearer,
                accept: self._api.header.accept
            }
        });
    } else {
        logger.fatal('Username/password or bearer token now found. Please check your code and try again')
    }
};

Samanage.prototype.config =  function(options) {

    let type = Object.prototype.toString.call(options);
    if (type === "[object Object]") {
        return this.config().set(options);
    } else if (type === "[object String]") {
        return this.config().get(options);
    }

    let self = this;
    let get = function (option) {
        return (option && self._options[option]) ? self._options[option] : self._options;
    };
    
    let set = function (options) {
        if (options) {
            let keys = Object.keys(options);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (self._options.hasOwnProperty(key)) {
                    self._options[key] = options[key];
                } else {
                    logger.warn('Option ' + key + ' is not a valid option, please check your code')
                }
            }
        } else {
            logger.warn("Can't SET anything if you don't give me arguments...");
        }
    };

    return {
        get: get,
        set: set
    }
};

Samanage.prototype.utils = {

    checkErrorCodes: function(res) {
        let code = res.statusCode;
        let codes = {
            400: `${code}, Please check your URL and try again`,
            401: `${code}, Please check your credentials are correct`,
            403: `${code}, Not allowed to access this page`,
            404: `${code}, ${res.body}`
        };

        return codes[res.statusCode] || (res.statusMessage !== '' ? res.statusMessage : res.body);
    }
};


/**
 *  Takes a query string or URL directly from Samanage and converts it to an object. This object can then be used
 * with the 'qs' option for request. incidents.search() calls this function if 'config' is a string.
 *
 * @param {String} qString query string to convert to an object for searching
 * @returns {Object}
 */
Samanage.prototype.createSearchObject = function(qString) {

    let y = qString.split("?");

    if (y.length > 1) { qString = y[1]; }

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


Samanage.prototype.MessageTemplate    = require(__dirname + '/lib/MessageTemplate'      );

Samanage.prototype.categories         = require(__dirname + '/lib/categories'           );
Samanage.prototype.changes            = require(__dirname + '/lib/changes'              );
Samanage.prototype.comments           = require(__dirname + '/lib/comments'             );
Samanage.prototype.configurationItems = require(__dirname + '/lib/configurationItems'   );
Samanage.prototype.contracts          = require(__dirname + '/lib/contracts'            );
Samanage.prototype.departments        = require(__dirname + '/lib/departments'          );
Samanage.prototype.groups             = require(__dirname + '/lib/groups'               );
Samanage.prototype.hardware           = require(__dirname + '/lib/hardware'             );
Samanage.prototype.incidents          = require(__dirname + '/lib/incidents'            );
Samanage.prototype.items              = require(__dirname + '/lib/items'                );
Samanage.prototype.memberships        = require(__dirname + '/lib/memberships'          );
Samanage.prototype.mobileDevices      = require(__dirname + '/lib/mobileDevices'        );
Samanage.prototype.otherAssets        = require(__dirname + '/lib/otherAssets'          );
Samanage.prototype.printers           = require(__dirname + '/lib/printers'             );
Samanage.prototype.problems           = require(__dirname + '/lib/problems'             );
Samanage.prototype.purchases          = require(__dirname + '/lib/purchases'            );
Samanage.prototype.purchaseOrders     = require(__dirname + '/lib/purchaseOrders'       );
Samanage.prototype.releases           = require(__dirname + '/lib/releases'             );
Samanage.prototype.risks              = require(__dirname + '/lib/risks'                );
Samanage.prototype.roles              = require(__dirname + '/lib/roles'                );
Samanage.prototype.serviceRequests    = require(__dirname + '/lib/serviceRequests'      );
Samanage.prototype.sites              = require(__dirname + '/lib/sites'                );
Samanage.prototype.software           = require(__dirname + '/lib/software'             );
Samanage.prototype.solutions          = require(__dirname + '/lib/solutions'            );
Samanage.prototype.tasks              = require(__dirname + '/lib/tasks'                );
Samanage.prototype.timeTracks         = require(__dirname + '/lib/timeTracks'           );
Samanage.prototype.users              = require(__dirname + '/lib/users'                );
Samanage.prototype.vendors            = require(__dirname + '/lib/vendors'              );

module.exports = Samanage;
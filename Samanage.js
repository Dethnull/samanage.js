"use strict";

let smConfig = require(__dirname + '/package.json');

let bunyan  = require('bunyan');
let request = require('request');

let logstream = require('./logstream');

let logger  = bunyan.createLogger({
    name: 'Samanage.js v' + smConfig.version,
    streams: [{
        type: "rotating-file",
        path: "./logs/Samanage.js.log",
        period: "1d",
        level: "debug"
    },{
        type: "raw",
        stream: logstream,
        level: "info"
    }]
});


//let utils = require(__dirname+'/utils'); // import createClone into the object chain.


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


/**
 *  Fairly simple authentication method as Samanage only allows for basic authentication over HTTPS
 *
 * @param username   -- Samanage Username Or just the Bearer token
 * @param password   -- Samanage Password
 * @returns request.defaults() object with the username/password basic or function to basic them iva auth.basic(u,p)
 */
/*Samanage.prototype.auth = function (username, password) {
    let self = this;

    if (username && password) return this.auth().basic(username, password);
    if (username) return this.auth().bearer(username);

    let basic = function (username, password) {
        self._request = self._request.defaults({
            auth: {
                username: (username.username || username.user || username),
                password: (username.password || username.pass || password)
            }
        })
    };

    let bearer = function(token) {
        if (self._api.header.accept != self._api.version[3]) {
            logger.fatal('Bearer token used, invalid api version for bearer token.');
            logger.fatal(`Found: ${self._api.header.accept}, Required: ${self._api.version[3]}`);
            process.exit(1);
        }

        self._request = self._request.defaults({
            auth: { bearer: token }
        })
    };
    
    return {
        basic: basic,
        bearer: bearer
    };
};*/

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

"use strict";

let smConfig = require(__dirname + '/package.json');

let bunyan  = require('bunyan');
let request = require('request');

let logstream = require('./logstream');

let logger  = bunyan.createLogger({
    name: 'samanage.js v' + smConfig.version,
    streams: [{
        type: "rotating-file",
        path: "./logs/samanage.js.log",
        period: "1d",
        level: "debug"
    },{
        type: "raw",
        stream: logstream,
        level: "info"
    }]
});



let utils = require(__dirname+'/utils');


let Samanage = function (options) {
    this._verbose   = 0;
    this._debug     = options.debug || 0;
    
    this._api = {
        header: { accept: 'application/vnd.samanage.v1.3+json' },
        url:    {
            app:  (options && options.app) ? options.app : 'api', // Default to api, settable to owned application name
            base: 'samanage.com',
            type: null
        }
    };

    this._options = {
        waitTime:   (options && options.waitTime)   ? options.waitTime      : 5000,
        sendEmail:  (options && options.sendEmail)  ? options.sendEmail     : true,
        incidentID: (options && options.incidentID) ? options.incidentID    : null,
        layout:     (options && options.layout)     ? options.layout        : "short"
    };
    
    this._auth = null; // Basic auth connection

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
 * @param username   -- Samanage Username
 * @param password   -- Samanage Password
 * @returns request.defaults() object with the username/password set or function to set them iva auth.set(u,p)
 */
Samanage.prototype.auth = function (username, password) {
    let my = this;

    if (username && password) return this.auth().set(username, password);

    let set = function (username, password) {
        my._request = my._request.defaults({
            auth: {
                username: (username.username || username.user || username),
                password: (username.password || username.pass || password)
            }
        })
    };
    
    return {
        set: set
    };
};

Samanage.prototype.options = function (options) {
    let my = this;


    let get = function (option) {
        return (option && my._options[option]) ? my._options[option] : my._options;
    };
    
    let set = function (options) {
        if (options) {
            let keys = Object.keys(options);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (my._options.hasOwnProperty(key)) {
                    my._options[key] = options[key];
                } else {
                    logger.warn('Option ' + key + ' is not a valid option, please check your code')
                }
            }
        } else {
            logger.warn("Can't SET anything if you don't give me arguments...");
        }
    };


    return options ? set(options) : get();
};


Samanage.prototype.categories         = require(__dirname + '/lib/categories');
Samanage.prototype.changes            = require(__dirname + '/lib/changes');
Samanage.prototype.comments           = require(__dirname + '/lib/comments');
Samanage.prototype.configurationItems = require(__dirname + '/lib/configurationItems');
Samanage.prototype.contracts          = require(__dirname + '/lib/contracts');
Samanage.prototype.departments        = require(__dirname + '/lib/departments');
Samanage.prototype.groups             = require(__dirname + '/lib/groups');
Samanage.prototype.hardware           = require(__dirname + '/lib/hardware');
Samanage.prototype.incidents          = require(__dirname + '/lib/incidents');
Samanage.prototype.items              = require(__dirname + '/lib/items');
Samanage.prototype.memberships        = require(__dirname + '/lib/memberships');
Samanage.prototype.mobileDevices      = require(__dirname + '/lib/mobileDevices');
Samanage.prototype.otherAssets        = require(__dirname + '/lib/otherAssets');
Samanage.prototype.printers           = require(__dirname + '/lib/printers');
Samanage.prototype.problems           = require(__dirname + '/lib/problems');
Samanage.prototype.purchases          = require(__dirname + '/lib/purchases');
Samanage.prototype.purchaseOrders     = require(__dirname + '/lib/purchaseOrders');
Samanage.prototype.releases           = require(__dirname + '/lib/releases');
Samanage.prototype.risks              = require(__dirname + '/lib/risks');
Samanage.prototype.roles              = require(__dirname + '/lib/roles');
Samanage.prototype.serviceRequests    = require(__dirname + '/lib/serviceRequests');
Samanage.prototype.sites              = require(__dirname + '/lib/sites');
Samanage.prototype.software           = require(__dirname + '/lib/software');
Samanage.prototype.solutions          = require(__dirname + '/lib/solutions');
Samanage.prototype.tasks              = require(__dirname + '/lib/tasks');
Samanage.prototype.timeTracks         = require(__dirname + '/lib/timeTracks');
Samanage.prototype.users              = require(__dirname + '/lib/users');
Samanage.prototype.vendors            = require(__dirname + '/lib/vendors');


module.exports = Samanage;

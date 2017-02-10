"use strict";

let chalk   = require('chalk');
let Stream  = require('stream');
let bunyan  = require('bunyan');

let logstream = new Stream();

logstream.writable = true;
logstream.write = function(obj) {
    let colorfy, msg = "";
    
    switch (obj.level) {
        case bunyan.DEBUG:
            colorfy = chalk.cyan;
            msg = chalk.cyan.bold.italic("DEBUG: ");
            break;
        case bunyan.INFO:
            msg = chalk.green.bold.italic("INFO: ");
            break;
        case bunyan.WARN:
            colorfy = chalk.yellow;
            msg = chalk.yellow.bold.italic("WARN: ");
            break;
        case bunyan.ERROR:
            colorfy = chalk.red;
            msg = chalk.red.bold.italic("ERROR: ");
            break;
        case bunyan.FATAL:
            colorfy = chalk.black.bgRed;
            msg = chalk.black.dim.bold.italic.bgRed("¡¡FATAL!! ");
            break;
        default: break;
    }
    
    if (colorfy)
        console.log(msg + colorfy(obj.msg));
    else
        console.log(msg + obj.msg);
};



module.exports = logstream;
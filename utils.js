"use strict";


if (typeof Object.createClone === "undefined") {
    Object.prototype.createClone = function () {
        return JSON.parse(JSON.stringify(this));
    };
} else {
    logger.fatal('Object.cloneit exists!! Something is going to clobber the object chain..');
}



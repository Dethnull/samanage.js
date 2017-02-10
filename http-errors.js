"use strict";


let HttpErrors = function (code, logger, message) {
    
    if (logger)
        logger("this is a message");
    else
        console.log('this is a test');
    
    
    
};


module.exports = HttpErrors;
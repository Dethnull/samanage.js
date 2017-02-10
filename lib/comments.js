"use strict";


let comments = function() {
    let my = this; //references Samanage object

    my.test = function() {
        console.log(my._api);
    };

    return my;
};

module.exports = comments;
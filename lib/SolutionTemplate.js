"use strict";

function SolutionTemplate() {
    let messObj = {
        solution: {}
    };

    /**
     *
     * @param {String} name
     */
    let setName = function(name) {
        if (Object.prototype.toString.call(name) ===  "[object String]") {
            messObj.solution.name = name;
        } else {
            console.log("Name must be a string");
        }

        return this;
    };

    let setTitle = setName;

    /**
     *
     * @param {String} description Description or message body of the solution
     */
    let setDescription = function(description) {
        if (Object.prototype.toString.call(description)) {
            messObj.solution.description = description;
        } else {
            console.log("Description should be a string");
        }

        return this;
    };

    /**
     * @description Set the portal homepage.
     *
     * @param {Boolean} homepage
     */
    let setPortalHomepage = function(homepage) {
        if (Object.prototype.toString.call(homepage) === "[object Boolean]") {
            messObj.solution.portal_homepage = homepage;
        } else {
            console.log("Portal homepage should be a boolean value");
        }
        return this;
    };

    /**
     * @description Set the state of the Solution. Resolve, Accepts
     *
     * TODO: Verify states for Solutions
     *
     * @param {String} state
     */
    let setState = function (state) {
        if (Object.prototype.toString.call(state) === "[object String]") {
            messObj.solution.state = state;
        } else {
            console.log("State should be a String value");
        }
        return this;
    };

    /**
     * @description Attach Incidents to this solution
     *
     * @param {Array} incidents
     * @param {Number} incidents
     * @returns {setIncidents}
     */
    let setIncidents = function(incidents) {
        let type = Object.prototype.toString.call(incidents);
        if (type === "[object Number]") {
            if (messObj.solution.incidents) {
                messObj.solution.incidents.incident.push({number: incidents});
            } else {
                messObj.solution.incidents = {incidents:[{number: incidents}]};
            }
        } else if (type === "[object Array]") {
            let len = incidents.length;
            for (let x = 0; x < len; x++) {
                setIncidents(incidents[x]);
            }
        } else {
            console.log("You must pass either an array of numbers or a single number.");
        }

        return this;
    };

    let setCustomFields = function(fields) {
        // TODO
    };

    /**
     * This returns the solution object which will be populated properly for the creation of a solution
     * @returns {{solution: {}}}
     */
    let getMessageObject = ()=> { return messObj; };


    return  {
        setDescription:     setDescription,
        setIncidents:       setIncidents,
        setName:            setName,
        setTitle:           setTitle,
        getMessageObject:   getMessageObject,
        setPortalHomepage:  setPortalHomepage,
        setState:           setState,
    }
}

module.exports = SolutionTemplate;
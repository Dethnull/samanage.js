"use strict";


/**
 * Currently this only supports passing incident or solution as the argument for this method
 * @param {String} messageType This should be set according to which object needs to be passed to Samanage. "incident", "solution". etc..
 * @returns {{addTags: addTags, setAssets: setAssets, setAssignee: setAssignee, setCategory: setCategory, setConfigurationItem: setConfigurationItem, setDescription: setDescription, setIncidents: setIncidents, setName: setName, setPriority: {none: (function()), low: (function()), medium: (function()), high: (function()), critical: (function()), set: (function(*))}, setProblem: setProblem, setRequester: setRequester, setResolution: setResolution, setSolutions: setSolutions, setState: setState, setSubCategory: setSubCategory, setDueDate: setDueDate, getMessageObject: (function())}}
 * @constructor
 */
function MessageTemplate(messageType) {
    let messObj = {};

    messObj[messageType] = {};
    
    

    /**
     * @description Set the "name" or Title of the incident
     * @param {string} name Title or "name" as Samanage calls it, of your Incident
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setName = function(name) {
        messObj[messageType]["name"] = name;
        return this;
    };

    /**
     * @description Set the body of your incident
     * @param {string} description Body of the incident message
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setDescription = function(description) {
        messObj[messageType]["description"] = description;
        return this;
    };


    /**
     * @description Set the priority level of incident.
     * @returns {{none: (function()), low: (function()), medium: (function()), high: (function()), critical: (function()), custom: (function(*))}}
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let priority = {
            none:       ()=>{messObj[messageType]["priority"] = "None"    },
            low:        ()=>{messObj[messageType]["priority"] = "Low"     },
            medium:     ()=>{messObj[messageType]["priority"] = "Medium"  },
            high:       ()=>{messObj[messageType]["priority"] = "High"    },
            critical:   ()=>{messObj[messageType]["priority"] = "Critical"},
            set:     (priority)=>{messObj[messageType]["priority"] = priority }
    };

    /**
     * TODO: Valid categories against Samanage
     *
     * @description Set category of incident. Must be valid in Samanage
     * @param {string} category
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setCategory = function(category) {
        messObj[messageType]["category"] = {
            name: category
        };

        return this;
    };

    /**
     * Set configuration items.
     *
     * The ID must be taken from the URL bar in Samanage.
     *
     * Example:
     * https://api.samanage.com/configuration_items/<b style="color: yellow">7240809</b>
     *
     * @param {Number} id Number ID to add to configuration items
     * @param {Array} id Array of ID's to add to configuration items
     *
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setConfigurationItem = function(id) {
        let type = Object.prototype.toString.call(id);
        if (type === "[object Number]") {
            if (messObj[messageType]["configuration_item_ids"]) {
                messObj[messageType]["configuration_item_ids"].push(id);
            } else {
                messObj[messageType]["configuration_item_ids"] = [id];
            }
        } else if (type === "[object Array]") {
            let len = id.length;
            for (let x = 0; x < len; x++) {
                setConfigurationItem(id[x]);
            }
        } else {
            console.log("Your configuration item ID was invalid. Please pass a number or an array of numbers and try again")
        }

        return this;
    };

    /**
     * @description Set the subcategory of incident. Must be valid in Samanage.
     * @param {string} subCategory
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setSubCategory = function(subCategory) {
        messObj[messageType]["subcategory"] = {
            name: subCategory
        };

        return this;
    };

    /**
     * @description Set requester to email
     * @param {string} email Valid only if an email address
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setRequester = function(email) {
        messObj[messageType]["requester"] = {
            email: email
        };
        return this;
    };

    /**
     * @description Set assignee to email address
     * @param {string} email Must be an email address
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setAssignee = function(email) {
        messObj[messageType]["assignee"] = {
            email: email
        };
        return this;
    };


    /**
     * @description Set dueDate of incident using either Date object or a string that's valid for the date Object.
     * @param {Date} dueDate Set due date with Date object
     * @param {string} dueDate Set due date with string, must be a dateString
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setDueDate = function(dueDate) {
        if (Object.prototype.toString.call(dueDate) === "[object Date]") {
            if (isNaN(dueDate.getDate())) {
                console.log("Date object invalid");
            } else {
                messObj[messageType]["due_at"] = dueDate.toString();
            }
        } else {
            let date = new Date(dueDate);
            return setDueDate(date); // Validates date object and sets date
        }
        return this;
    };


    /**
     * @description Sets or adds additional incidents to be tied to the this incident. Can be an array or single number.
     * @param {number} incidentsNum Incident number
     * @param {Array} incidentsNum
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setIncidents = function(incidentsNum) {
        let type = Object.prototype.toString.call(incidentsNum);
        if (type === "[object Number]") {
            if (messObj[messageType].incidents) {
                messObj[messageType].incidents.incident.push({number: incidentsNum});
            } else {
                messObj[messageType]["incidents"] = {incident: [{number: incidentsNum}]};
            }
        } else if (type === "[object Array]") {
            let len = incidentsNum.length;
            for (let x = 0; x < len; x++){
                setIncidents(incidentsNum[x]);
            }
        } else {
            console.log("Incident number isn't a valid type");
        }

        return this;
    };

    /**
     *
     * @param {number} assets Pass a single asset ID to be included with incident
     * @param {Array} assets Pass an array of asset ID's to be included with Incident
     *
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setAssets = function(assets) {
        let type = Object.prototype.toString.call(assets);
        if (type === "[object Number]") {
            if (messObj[messageType].assets) {
                messObj[messageType].assets.push({id: assets});
            } else {
                messObj[messageType]["assets"] = [{id: assets}];
            }
        } else if (type === "[object Array]") {
            let len = assets.length;
            for (let x = 0; x < len; x++) {
                setAssets(assets[x]);
            }
        } else {
            console.log("Your assets number was invalid. Please pass a number or an array of numbers and try again")
        }
        return this;
    };

    /**
     *
     * @param {Number} problems
     * @param {Array} problems
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setProblem = function(problems) {
        let type = Object.prototype.toString.call(problems);
        if (type === "[object Number]") {
            if (messObj[messageType].problem) {
                messObj[messageType].problem.push({number: problems});
            } else {
                messObj[messageType]["problem"] = [{number: problems}];
            }
        } else if (type === "[object Array]") {
            let len = problems.length;
            for (let x = 0; x < len; x++) {
                setProblem(problems[x]);
            }
        } else {
            console.log("Your problem number was invalid. Please pass a number or an array of numbers and try again")
        }
        return this;
    };

    /**
     *
     * @param {Number} solutions This should be the number from Samanage, not the ID from the URL
     * @param {Array} solutions
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setSolutions = function(solutions) {
        let type = Object.prototype.toString.call(solutions);
        if (type === "[object Number]") {
            if (messObj[messageType].solutions) {
                messObj[messageType].solutions.solution.push({number: solutions});
            } else {
                messObj[messageType]["solutions"] = {solution: [{number: solutions}]};
            }
        } else if (type === "[object Array]") {
            let len = solutions.length;
            for (let x = 0; x < len; x++){
                setSolutions(solutions[x]);
            }
        } else {
            console.log("Solutions number isn't a valid type");
        }
        return this;
    };

    /**
     *
     * @param {string} tags Tags should be separated by a comma. This will be append
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let addTags = function(tags) {
        if (messObj[messageType]["add_to_tag_list"]) {
            messObj[messageType]["add_to_tag_list"] += tags;
        } else {
            messObj[messageType]["add_to_tag_list"] = tags;
        }
        return this;
    };

    /**
     *
     * @param {number} state the ID of the state you wish to use. This is tricky to get out of Samanage. Open the dev tools in chrome and then close a ticket to review the request, there you will find the ID of your states.
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setState = function(state) {
        let type = Object.prototype.toString.call(state);
        if (type === "[object Number]") {
            messObj[messageType]["state_id"] = state;
        } else if (type === "[object String]" && messageType === "solution") {
            messObj[messageType]["state"] = state;
        } else {
            switch (messageType) {
                case "incident":
                    console.log("Your incident state_id should be a number");
                    break;
                case "solution":
                    console.log("your solution state should be a string");
                    break;
                default:
                    console.log("Your state ID is incorrect for the provided " + messageType);
                    break;
            }
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
     *
     * @param {String} message Resolution message, to be used with setState
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setResolution = function(message) {
        messObj[messageType].resolution = message;
        return this;
    };

    /**
     * Set your own custom fields
     * @param customFields
     * @returns {Object} this Returns the messageTemplate object so you can chain calls
     */
    let setCustomFieldValues = function(customFields) {
        // TODO
        return this;
    };

    return {
        addTags:                addTags,
        setAssets:              setAssets,
        setAssignee:            setAssignee,
        setCategory:            setCategory,
        setConfigurationItem:   setConfigurationItem,
        setDescription:         setDescription,
        setIncidents:           setIncidents,
        setName:                setName,
        setPortalHomepage:      setPortalHomepage,
        setPriority:            priority,
        setProblem:             setProblem,
        setRequester:           setRequester,
        setResolution:          setResolution,
        setSolutions:           setSolutions,
        setState:               setState,
        setSubCategory:         setSubCategory,
        setTitle:               setName,
        setDueDate:             setDueDate,
        getMessageObject:       messObj
    }
}

module.exports = MessageTemplate;
"use strict";

function IncidentTemplate() {
    let messObj = {
        incident: {}
    };

    /**
     * @description Set the "name" or Title of the incident
     * @param {string} name Title or "name" as Samanage calls it, of your Incident
     */
    let setName = function(name) {
        messObj.incident["name"] = name;
    };

    /**
     * @description Set the body of your incident
     * @param {string} description Body of the incident message
     */
    let setDescription = function(description) {
        messObj.incident["description"] = description;
    };


    /**
     * @description Set the priority level of incident.
     * @returns {{none: (function()), low: (function()), medium: (function()), high: (function()), critical: (function()), custom: (function(*))}}
     */
    let priority = {
            none:       ()=>{messObj.incident["priority"] = "None"    },
            low:        ()=>{messObj.incident["priority"] = "Low"     },
            medium:     ()=>{messObj.incident["priority"] = "Medium"  },
            high:       ()=>{messObj.incident["priority"] = "High"    },
            critical:   ()=>{messObj.incident["priority"] = "Critical"},
            custom:     (priority)=>{messObj.incident["priority"] = priority }
    };

    /**
     * TODO: Valid categories against Samanage
     *
     * @description Set category of incident. Must be valid in Samanage
     * @param {string} category
     */
    let setCategory = function(category) {
        messObj.incident["category"] = {
            name: category
        }
    };

    /**
     * Set configuration items
     * @param {number} id Single ID to add to configuration items
     * @param {Array} id Array of ID's to add to configuration items
     */
    let setConfigurationItem = function(id) {
        let type = Object.prototype.toString.call(id);
        if (type === "[object Number]") {
            if (messObj.incident["configuration_item_ids"]) {
                messObj.incident["configuration_item_ids"].push(id);
            } else {
                messObj.incident["configuration_item_ids"] = [id];
            }
        } else if (type === "[object Array]") {
            let len = id.length;
            for (let x = 0; x < len; x++) {
                setConfigurationItem(id[x]);
            }
        } else {
            console.log("Your configuration item ID was invalid. Please pass a number or an array of numbers and try again")
        }
    };

    /**
     * @description Set the subcategory of incident. Must be valid in Samanage.
     * @param {string} subCategory
     */
    let setSubCategory = function(subCategory) {
        messObj.incident["subcategory"] = {
            name: subCategory
        }
    };

    /**
     * @description Set requester to email
     * @param {string} email Valid only if an email address
     */
    let setRequester = function(email) {
        messObj.incident["requester"] = {
            email: email
        }
    };

    /**
     * @description Set assignee to email address
     * @param {string} email Must be an email address
     */
    let setAssignee = function(email) {
        messObj.incident["assignee"] = {
            email: email
        }
    };


    /**
     * @description Set dueDate of incident using either Date object or a string that's valid for the date Object.
     * @param {Date} dueDate Set due date with Date object
     * @param {string} dueDate Set due date with string, must be a dateString
     */
    let setDueDate = function(dueDate) {
        if (Object.prototype.toString.call(dueDate) === "[object Date]") {
            if (isNaN(dueDate.getDate())) {
                console.log("Date object invalid");
            } else {
                messObj.incident["due_at"] = dueDate.toString();
            }
        } else {
            let date = new Date(dueDate);
            return setDueDate(date); // Validates date object and sets date
        }
    };


    /**
     * @description Sets or adds additional incidents to be tied to the this incident. Can be an array or single number.
     * @param {number} incidentsNum Incident number
     * @param {Array} incidentsNum
     */
    let setIncidents = function(incidentsNum) {
        let type = Object.prototype.toString.call(incidentsNum);
        if (type === "[object Number]") {
            if (messObj.incident.incidents) {
                messObj.incident.incidents.incident.push({number: incidentsNum});
            } else {
                messObj.incident["incidents"] = {incident: [{number: incidentsNum}]};
            }
        } else if (type === "[object Array]") {
            let len = incidentsNum.length;
            for (let x = 0; x < len; x++){
                setIncidents(incidentsNum[x]);
            }
        } else {
            console.log("Incident number isn't a valid type");
        }
    };

    /**
     *
     * @param {number} assets Pass a single asset ID to be included with incident
     * @param {Array} assets Pass an array of asset ID's to be included with Incident
     */
    let setAssets = function(assets) {
        let type = Object.prototype.toString.call(assets);
        if (type === "[object Number]") {
            if (messObj.incident.assets) {
                messObj.incident.assets.push({id: assets});
            } else {
                messObj.incident["assets"] = [{id: assets}];
            }
        } else if (type === "[object Array]") {
            let len = assets.length;
            for (let x = 0; x < len; x++) {
                setAssets(assets[x]);
            }
        } else {
            console.log("Your assets number was invalid. Please pass a number or an array of numbers and try again")
        }
    };

    /**
     *
     * @param {Number} problems
     * @param {Array} problems
     */
    let setProblem = function(problems) {
        let type = Object.prototype.toString.call(problems);
        if (type === "[object Number]") {
            if (messObj.incident.problem) {
                messObj.incident.problem.push({number: problems});
            } else {
                messObj.incident["problem"] = [{number: problems}];
            }
        } else if (type === "[object Array]") {
            let len = problems.length;
            for (let x = 0; x < len; x++) {
                setProblem(problems[x]);
            }
        } else {
            console.log("Your problem number was invalid. Please pass a number or an array of numbers and try again")
        }
    };

    /**
     *
     * @param {Number} solutions This should be the number from Samange, no the ID from the URL
     * @param {Array} solutions
     */
    let setSolutions = function(solutions) {
        let type = Object.prototype.toString.call(solutions);
        if (type === "[object Number]") {
            if (messObj.incident.solutions) {
                messObj.incident.solutions.solution.push({number: solutions});
            } else {
                messObj.incident["solutions"] = {solution: [{number: solutions}]};
            }
        } else if (type === "[object Array]") {
            let len = solutions.length;
            for (let x = 0; x < len; x++){
                setSolutions(solutions[x]);
            }
        } else {
            console.log("Solutions number isn't a valid type");
        }
    };

    let addTags = function(tags) {
        if (messObj.incident["add_to_tag_list"]) {
            messObj.incident["add_to_tag_list"] += tags;
        }
    };

    let setState = function(state) {
        let type = Object.prototype.toString.call(state);
        if (type === "[object Number]") {
            messObj.incident["state_id"] = state;
        } else {
            console.log("You're state_id should be a number");
        }
    };

    let setResolution = function(message) {
        messObj.incident.resolution = message;
    };

    /**
     * Set your own custom fields
     * @param customFields
     */
    let setCustomFieldValues = function(customFields) {
        // TODO
    };

    let getMessageObject = ()=> { return messObj; };


    return {
        addTags:                addTags,
        setAssets:              setAssets,
        setAssignee:            setAssignee,
        setCategory:            setCategory,
        setConfigurationItem:   setConfigurationItem,
        setDescription:         setDescription,
        setIncidents:           setIncidents,
        setName:                setName,
        setPriority:            priority,
        setProblem:             setProblem,
        setRequester:           setRequester,
        setResolution:          setResolution,
        setSolutions:           setSolutions,
        setState:               setState,
        setSubCategory:         setSubCategory,
        setDueDate:             setDueDate,
        getMessageObject:       getMessageObject
    }
}

module.exports = IncidentTemplate;
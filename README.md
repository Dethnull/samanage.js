# Samanage.js
Samanage API implementation for NodeJS

**NOTE:** This lib is a work in progress. At the moment I'm implementing functionality that I utilize in my day job. I welcome all contributions and tips.



#TODO
   *Actually write this usage guide.




#Simple Usage


```js
// These ID's are used for the resolution states for incidents. You can obtain these ID's by looking at the requests made through the GUI
let samanage = new (require('samanage'))({
    stateID: {
        resolved: 68591,
        on_hold: 68590,
        awaiting_input: 68589,
        assigned: 68588,
        "new": 68587
    }
});

let incidents = samanage.incidents();
let MessageObject = samanage.messageObject;


let testMessage = new MessageObject()
                        .setTitle("Test title")
                        .setDescription("Test description")
                        .getMessageObject;

incidents.create(testMessage).then(function(result) {
    console.log(result.body);
});

```
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

// Bearer token
// You can get the bearer token from viewing your own profile as an admin in Samanage
samanage.auth({
    bearer: "xxxxxxx"
});

// Basic auth
samanage.auth({
    user: "user@domain.com",
    pass: "password"
});


let incidents = samanage.incidents();
let MessageTemplate = samanage.MessageTemplate;


let testMessage = new MessageTemplate()
                        .setTitle("Test title")
                        .setDescription("Test description")
                        .getMessageObject;

incidents.create(testMessage).then(function(result) {
    console.log(result.body);
});

```


#Searching
```js
let incidents = samanage.incidents();

// Search can be a samanage URI or an object of key: value pairs. These pairs must be a field in your samanage instance to search
incidents.search({title: "test title*"}).then(function(res) {
    // returns res, body, page#
    
    console.log(res.body);
})


```
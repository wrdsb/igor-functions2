module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var owners = [];
    var managers = [];

    var studentOwned = false;
    var staffOwned = false;
    var studentManaged = false;
    var staffManaged = false;

    var blob = context.bindings.groupMembershipsNow;
    var memberships = blob.actual;
    var membershipsArray = Object.getOwnPropertyNames(memberships);

    membershipsArray.forEach(function(email) {
        if (memberships[email]['role'] == 'OWNER') {
            owners.push(email);
            if (/\d/.test(email)) {
                studentOwned = true;
            } else {
                staffOwned = true;
            }
        }
        if (memberships[email]['role'] == 'MANAGER') {
            managers.push(email);
            if (/\d/.test(email)) {
                studentManaged = true;
            } else {
                staffManaged = true;
            }
        }
    });

    var res = {
        "email": req.body.group,
        "owners": owners,
        "managers": managers,
        "studentOwned": studentOwned,
        "staffOwned": staffOwned,
        "studentManaged": studentManaged,
        "staffManaged": staffManaged,
    }

    context.res = {
        status: 200,
        body: res
    };
    context.log(res);
    context.done(null);
}
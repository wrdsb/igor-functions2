module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var owners = [];
    var managers = [];

    var blob = context.bindings.groupMembershipsNow;
    var memberships = blob.actual;
    var membershipsArray = Object.getOwnPropertyNames(memberships);

    membershipsArray.forEach(function(email) {
        if (memberships[email]['role'] == 'OWNER') {
            owners.push(email);
        }
        if (memberships[email]['role'] == 'MANAGER') {
            managers.push(email);
        }
    });

    var res = {
        "email": req.body.group,
        "owners": owners,
        "managers": managers
    }

    context.res = {
        status: 200,
        body: res
    };
    context.log(res);
    context.done(null);
}
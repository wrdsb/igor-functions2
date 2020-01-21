module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z

    var memberships = context.bindings.groupMembershipsNow;

    context.res = {
        status: 200,
        body: memberships
    };
    context.log(memberships);
    context.done(null, memberships);
}
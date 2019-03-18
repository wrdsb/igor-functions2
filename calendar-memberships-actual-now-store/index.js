module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z

    context.bindings.calendarMembershipsNow = JSON.stringify(req.body.memberships);

    context.res = {
        status: 200,
        body: req.body.memberships
    };

    context.log(context.res);
    context.done(null, context.res);
}
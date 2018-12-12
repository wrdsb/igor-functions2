module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z

    context.bindings.groupMembershipsNow = req.body;

    return {
        status: 200
    };
}
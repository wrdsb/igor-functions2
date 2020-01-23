module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var groups = context.bindings.cosmosGroups;

    var res = groups;

    context.res = {
        status: 200,
        body: res
    };
    context.log(res);
    context.done(null);
}
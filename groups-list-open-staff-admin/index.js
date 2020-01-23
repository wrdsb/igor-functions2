module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var groups = context.bindings.cosmosGroups;
    var groupAdmins = [];

    groups.forEach(function(group) {
        var admins = group.owners.concat(group.managers);
        var adminsString = '';

        admins.forEach(function(admin) {
            adminsString = adminsString + admin;
            adminsString = adminsString + ',';
        });
        adminsString = adminsString.slice(0, -1);

        groupAdmins.push(
            {
                "email": group.email,
                "name": group.name,
                "group-admins": adminsString
            }
        );
    });

    var res = groupAdmins;

    context.res = {
        status: 200,
        body: groupAdmins
    };
    context.log(res);
    context.done(null);
}
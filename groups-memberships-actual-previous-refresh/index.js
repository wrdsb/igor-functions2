module.exports = function (context, data) {
    var group_name = data.body.group;

    // Overwrite previous file with now file
    context.log(`Overwrite previous file with contents of now file for ${group_name}`);
    context.bindings.groupMembershipsPrevious = context.bindings.groupMembershipsNow;

    context.done();
};
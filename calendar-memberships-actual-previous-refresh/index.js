module.exports = function (context, data) {
    var calendar_name = data.body.group;

    // Overwrite previous file with now file
    context.log(`Overwrite previous file with contents of now file for ${calendar_name}`);
    context.bindings.calendarMembershipsPrevious = context.bindings.calendarMembershipsNow;

    context.done();
};
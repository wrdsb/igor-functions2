module.exports = function (context, req) {
    var calendar = req.body.calendar;

    var memberships_actual = context.bindings.membershipsActual.actual;
    var memberships_ipps = context.bindings.membershipsIPPS;
    var memberships_central = context.bindings.membershipsOverrides.central;

    var memberships_ideal = Object.assign(memberships_ipps, memberships_central);

    // objects to store our diff parts
    var missing_memberships = [];
    var changed_memberships = [];
    var extra_memberships = [];
    var diff = {};

    context.log('Calculating membership diff for Calendar ' + calendar.slug);

    Object.getOwnPropertyNames(memberships_ideal).forEach(function (member) {
        if (!memberships_actual[member]) {
            console.log('Did not find member: ' + member);
            var missing_member = memberships_ideal[member];
            missing_member.calendar_id = calendar.google_id;
            missing_memberships.push(missing_member);
        } else {
            if (memberships_actual[member].acl.role != memberships_ideal[member].acl.role) {
                context.log(member +' role changed from '+ memberships_actual[member].acl.role +' to '+ memberships_ideal[member].acl.role +' in '+ calendar.slug);
                var changed_member = memberships_ideal[member];
                changed_member.calendar_id = calendar.google_id;
                changed_memberships.push(changed_member);
            }
        }
    });

    Object.getOwnPropertyNames(memberships_actual).forEach(function (member) {
        if (!memberships_ideal[member]) {
            console.log('Found extra member: ' + member);
            var extra_member = {};
            extra_member.rule_id = memberships_actual[member].id;
            extra_member.calendar_id = calendar.google_id;
            extra_memberships.push(extra_member);
        }
    });

    diff.missing_memberships = missing_memberships;
    diff.changed_memberships = changed_memberships;
    diff.extra_memberships = extra_memberships;

    context.log(diff);
    context.bindings.membershipsDiff = diff;

    context.done(null, 'Finished calculating membership diff for Calendar ' + calendar.slug);
};
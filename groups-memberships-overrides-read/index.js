module.exports = function (context, data, igorRecord) {
    var group = data.group;
    var memberships = [];

    if (!igorRecord)
    {
        context.log("Record not found");
    }
    else
    {
        context.log(igorRecord);

        var central = igorRecord.central;
        Object.getOwnPropertyNames(central).forEach(function (override_name) {
            var override = central[override_name];
            var membership = {
                email: override.email,
                role: override.role,
                status: override.status,
                source: "central"
            };
            memberships.push(membership);
        });
    }

    context.res = {
        status: 200,
        body: memberships
    };

    context.done(null, `Listed membership overrides for group ${group}`);
};

module.exports = function (context, data, igorRecord) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z

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

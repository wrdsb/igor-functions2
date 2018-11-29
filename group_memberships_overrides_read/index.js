module.exports = function (context, data, igorRecord) {
    var group = data.group;
    var memberships_array = [];

    if (!igorRecord)
    {
        context.log("Record not found");
    }
    else
    {
        context.log(igorRecord);

        var central = igorRecord.central;
        Object.getOwnPropertyNames(central).forEach(function (override) {
            var item = central[override];
            var membership = {
                email: item.email,
                role: item.role,
                status: item.status,
                source: "central"
            };
            memberships_array.push(membership);
        });
    }

    context.res = {
        status: 200,
        body: memberships_array
    };

    context.done(null, `Listed membership overrides for group ${group}`);
};

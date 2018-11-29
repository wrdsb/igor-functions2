module.exports = function (context, data, igorRecord) {
    var group = data.group;

    if (!igorRecord)
    {
        context.log("Record not found");
    }
    else
    {
        context.log(igorRecord);
    }

    var memberships_array = [
        {
            email: "email_address1@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address2@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address3@wrdsb.ca",
            role: "MEMBER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address4@wrdsb.ca",
            role: "MEMBER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address5@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address6@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address7@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address8@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address9@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        },
        {
            email: "email_address10@wrdsb.ca",
            role: "MANAGER",
            status: "ACTIVE",
            source: "central"
        }
    ];

    context.res = {
        status: 200,
        body: igorRecord
    };

    context.done(null, `Listed membership overrides for group ${group}`);
};

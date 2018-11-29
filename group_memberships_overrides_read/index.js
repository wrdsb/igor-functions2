module.exports = function (context, data) {
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
        body: memberships_array
    };

    context.done(null, 'Listed membership overrides for group abe-its@wrdsb.ca');
};

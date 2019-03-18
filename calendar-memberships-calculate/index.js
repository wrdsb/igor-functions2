module.exports = async function (context) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var rows = context.bindings.iamwpRaw;

    var calendars = {
        staffing_ea_cyw_calendar: {
            id: "staffing-ea-cyw",
            slug: "staffing-ea-cyw",
            summary: "Staffing - EA/CYW",
            google_id: "t9rlt3pmanhptimla7tt94vlj0@group.calendar.google.com"
        },

        staffing_dece_calendar: {
            id: "staffing-dece",
            slug: "staffing-dece",
            summary: "Staffing - DECE",
            google_id: "l0oq06id0gkeqmgnb2tvhfdp4c@group.calendar.google.com"
        },

        staffing_teachers_elementary_calendar: {
            id: "staffing-teachers-elementary",
            slug: "staffing-teachers-elementary",
            summary: "Staffing - Teachers - Elementary",
            google_id: "dudbedpo7ou3tcg16p40lfgjbc@group.calendar.google.com"
        },

        staffing_teachers_secondary_calendar: {
            id: "staffing-teachers-secondary",
            slug: "staffing-teachers-secondary",
            summary: "Staffing - Teachers - Secondary",
            google_id: "90enetgqq45kg53vc30l3af2hk@group.calendar.google.com"
        }
    };

    var container = 'calendar-memberships-ipps-now';
    var excluded_job_codes = ['6106', '6118'];
    var activity_codes = ['ACTIVE', 'ONLEAVE'];

    var azure = require('azure-storage');
    var blobService = azure.createBlobService(
        'wrdsbigor',
        process.env['wrdsbigor_STORAGE_KEY']
    );

    var elementary_staffing_support_job_codes = context.bindings.elementaryStaffingSupportJobCodes.job_codes;
    
    var secondary_admin_job_codes = context.bindings.secondaryAdminJobCodes.job_codes;

    var calculated_members = await calculateMembers(rows, calendars);
    var blob_results = await parseMembers(calculated_members);

    var response = {};
    response.count = 0;
    
    blob_results.forEach(function(blob) {
        response[blob.name] = blob.totalSize;
        response.count++;
    });

    return {
        status: 200,
        body: JSON.stringify(response)
    };

    async function parseMembers(members) {
        var create_blob_results = [];
        Object.getOwnPropertyNames(members).forEach(async function(calendar_slug) {
            var result = await createBlob(container, calculated_members, calendar_slug);
            create_blob_results.push(result);
        });
        return create_blob_results;
    }

    async function createBlob(container, members, calendar_slug) {
        var blob_name = calendar_slug +'.json';
        var memberships = JSON.stringify(members[calendar_slug]);

        var result = blobService.createBlockBlobFromText(container, blob_name, memberships, function(error, result, response) {
            if (!error) {
                context.log(result);
                context.log(response);
            } else {
                context.log(error);
            }
        });
        return result;
    }

    async function calculateMembers (rows, calendars) {
        var members = {};

        rows.forEach(function(row) {
            if (row.EMAIL_ADDRESS
                && !excluded_job_codes.includes(row.JOB_CODE)
                && activity_codes.includes(row.ACTIVITY_CODE)
            ) {
                if (row.EMAIL_ADDRESS) {
                    var email = row.EMAIL_ADDRESS;
                }
                if (row.JOB_CODE) {
                    var job_code = row.JOB_CODE;
                }
                if (row.EMP_GROUP_CODE) {
                    var group_code = row.EMP_GROUP_CODE;
                }
                if (row.LOCATION_CODE) {
                    var location_code = row.LOCATION_CODE;
                }
                if (row.SCHOOL_CODE) {
                    var school_code = row.SCHOOL_CODE.toLowerCase();
                }
                if (row.PANEL) {
                    var panel = row.PANEL;
                }
                if (row.ACTIVITY_CODE) {
                    var activity_code = row.ACTIVITY_CODE;
                }

                if (elementary_staffing_support_job_codes.includes(job_code)) {

                    if (!members['staffing-teachers-elementary']) {
                        members['staffing-teachers-elementary'] = {};
                    }
                    members['staffing-teachers-elementary'][email] = {
                        acl: {
                            scope: {
                                type: "user", 
                                value: email,
                            },
                            role: "reader"
                        },
                        calendar_id: calendars.staffing_teachers_elementary_calendar.google_id
                    };

                    if (!members['staffing-ea-cyw']) {
                        members['staffing-ea-cyw'] = {};
                    }
                    members['staffing-ea-cyw'][email] = {
                        acl: {
                            scope: {
                                type: "user", 
                                value: email,
                            },
                            role: "reader"
                        },
                        calendar_id: calendars.staffing_ea_cyw_calendar.google_id
                    };

                    if (!members['staffing-dece']) {
                        members['staffing-dece'] = {};
                    }
                    members['staffing-dece'][email] = {
                        acl: {
                            scope: {
                                type: "user", 
                                value: email,
                            },
                            role: "reader"
                        },
                        calendar_id: calendars.staffing_dece_calendar.google_id
                    };
                }
                
                if (secondary_admin_job_codes.includes(job_code)) {
                    if (!members['staffing-teachers-secondary']) {
                        members['staffing-teachers-secondary'] = {};
                    }
                    members['staffing-teachers-secondary'][email] = {
                        acl: {
                            scope: {
                                type: "user", 
                                value: email,
                            },
                            role: "reader"
                        },
                        calendar_id: calendars.staffing_teachers_secondary_calendar.google_id
                    };

                    if (!members['staffing-ea-cyw']) {
                        members['staffing-ea-cyw'] = {};
                    }
                    members['staffing-ea-cyw'][email] = {
                        acl: {
                            scope: {
                                type: "user", 
                                value: email,
                            },
                            role: "reader"
                        },
                        calendar_id: calendars.staffing_ea_cyw_calendar.google_id
                    };
                }
            }
        });
        return members;
    }
}

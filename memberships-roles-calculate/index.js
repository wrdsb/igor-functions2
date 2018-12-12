module.exports = async function (context) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var rows = context.bindings.iamwpRaw;

    var container = 'groups-memberships-ipps-now';
    var excluded_job_codes = ['6106', '6118'];
    var activity_codes = ['ACTIVE', 'ONLEAVE'];

    var azure = require('azure-storage');
    var blobService = azure.createBlobService(
        'wrdsbigor',
        process.env['wrdsbigor_STORAGE_KEY']
    );

    var elementary_admin_job_codes = context.bindings.elementaryAdminJobCodes.job_codes;
    var elementary_head_secretaries_job_codes = context.bindings.elementaryHeadSecretariesJobCodes.job_codes;
    var elementary_c_secretaries_job_codes = context.bindings.elementaryCSecretariesJobCodes.job_codes;
    var elementary_ot_teachers_job_codes = context.bindings.elementaryOtTeachersJobCodes.job_codes;
    var elementary_teachers_group_codes = context.bindings.elementaryTeachersGroupCodes.group_codes;
    var elementary_staffing_support_job_codes = context.bindings.elementaryStaffingSupportJobCodes.job_codes;
    
    var secondary_admin_job_codes = context.bindings.secondaryAdminJobCodes.job_codes;
    var secondary_office_supervisors_job_codes = context.bindings.secondaryOfficeSupervisorsJobCodes.job_codes;
    var secondary_office_assistants_job_codes = context.bindings.secondaryOfficeAssistantsJobCodes.job_codes;
    var secondary_c_secretaries_job_codes = context.bindings.secondaryCSecretariesJobCodes.job_codes;
    var secondary_teachers_group_codes = context.bindings.secondaryTeachersGroupCodes.group_codes;
    var secondary_ot_teachers_group_codes = context.bindings.secondaryOtTeachersGroupCodes.group_codes;

    var calculated_members = await calculateMembers(rows);
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
        Object.getOwnPropertyNames(members).forEach(async function(group_slug) {
            var result = await createBlob(container, calculated_members, group_slug);
            create_blob_results.push(result);
        });
        return create_blob_results;
    }

    async function createBlob(container, members, group_slug) {
        var blob_name = group_slug +'@wrdsb.ca.json';
        var memberships = JSON.stringify(members[group_slug]);

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

    async function calculateMembers (rows) {
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

                if (elementary_admin_job_codes.includes(job_code)) {
                    if (!members['elementary-admin']) {
                        members['elementary-admin'] = {};
                    }
                    members['elementary-admin'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "elementary-admin@wrdsb.ca"
                    };
                }
                
                if (elementary_head_secretaries_job_codes.includes(job_code)) {
                    if (!members['elementary-head-secretaries']) {
                        members['elementary-head-secretaries'] = {};
                    }
                    members['elementary-head-secretaries'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "elementary-head-secretaries@wrdsb.ca"
                    };
                }
                
                if (elementary_c_secretaries_job_codes.includes(job_code)) {
                    if (!members['elementary-c-secretaries']) {
                        members['elementary-c-secretaries'] = {};
                    }
                    members['elementary-c-secretaries'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "elementary-c-secretaries@wrdsb.ca"
                    };
                }
                
                if (elementary_teachers_group_codes.includes(group_code)) {
                    if (!members['elementary-teachers']) {
                        members['elementary-teachers'] = {};
                    }
                    members['elementary-teachers'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "elementary-teachers@wrdsb.ca"
                    };
                }
                
                if (elementary_ot_teachers_job_codes.includes(job_code)) {
                    if (!members['elementary-ot-teachers']) {
                        members['elementary-ot-teachers'] = {};
                    }
                    members['elementary-ot-teachers'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "elementary-ot-teachers@wrdsb.ca"
                    };
                }
                
                if (elementary_staffing_support_job_codes.includes(job_code)) {
                    if (!members['elementary-staffing-support']) {
                        members['elementary-staffing-support'] = {};
                    }
                    members['elementary-staffing-support'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'elementary-staffing-support@wrdsb.ca'
                    };
                }
                
                if (secondary_admin_job_codes.includes(job_code)) {
                    if (!members['secondary-admin']) {
                        members['secondary-admin'] = {};
                    }
                    members['secondary-admin'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "secondary-admin@wrdsb.ca"
                    };
                }
                
                if (secondary_office_supervisors_job_codes.includes(job_code)) {
                    if (!members['secondary-office-supervisors']) {
                        members['secondary-office-supervisors'] = {};
                    }
                    members['secondary-office-supervisors'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "secondary-office-supervisors@wrdsb.ca"
                    };
                }
                
                if (secondary_office_assistants_job_codes.includes(job_code)) {
                    if (!members['secondary-office-assistants']) {
                        members['secondary-office-assistants'] = {};
                    }
                    members['secondary-office-assistants'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "secondary-office-assistants@wrdsb.ca"
                    };
                }
                
                if (secondary_c_secretaries_job_codes.includes(job_code)) {
                    if (!members['secondary-c-secretaries']) {
                        members['secondary-c-secretaries'] = {};
                    }
                    members['secondary-c-secretaries'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "secondary-c-secretaries@wrdsb.ca"
                    };
                }
                
                if (secondary_teachers_group_codes.includes(group_code)) {
                    if (!members['secondary-teachers']) {
                        members['secondary-teachers'] = {};
                    }
                    members['secondary-teachers'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "secondary-teachers@wrdsb.ca"
                    };
                }
                
                if (secondary_ot_teachers_group_codes.includes(group_code)) {
                    if (!members['secondary-ot-teachers']) {
                        members['secondary-ot-teachers'] = {};
                    }
                    members['secondary-ot-teachers'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "secondary-ot-teachers@wrdsb.ca"
                    };
                }
            }
        });
        return members;
    }
}

module.exports = async function (context, message) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var requested_school_code = message.school_code.toLowerCase();

    var rows = context.bindings.iamwpRaw;

    var container = 'groups-memberships-ipps-now';
    var excluded_job_codes = ['6106', '6118'];
    var activity_codes = ['ACTIVE', 'ONLEAVE'];

    var azure = require('azure-storage');
    var blobService = azure.createBlobService(
        'wrdsbigor',
        process.env['wrdsbigor_STORAGE_KEY']
    );

    var admin_job_codes = context.bindings.abcAdminJobCodes.job_codes;
    var attendance_job_codes = context.bindings.abcAttendanceJobCodes.job_codes;
    var beforeafter_job_codes = context.bindings.abcBeforeafterJobCodes.job_codes;
    var courier_job_codes = context.bindings.abcCourierJobCodes.job_codes;
    var easyconnect_job_codes = context.bindings.abcEasyconnectJobCodes.job_codes;
    var its_job_codes = context.bindings.abcItsJobCodes.job_codes;
    var office_job_codes = context.bindings.abcOfficeJobCodes.job_codes;
    var orders_job_codes = context.bindings.abcOrdersJobCodes.job_codes;
    var s4s_job_codes = context.bindings.abcS4sJobCodes.job_codes;

    var calculated_members = await calculateMembers(rows);
    var staff_members = calculated_members[0];
    var public_members = calculated_members[1];
    
    var staff_blob_results = await parseStaffMembers(staff_members);
    var public_blob_results = await parsePublicMembers(public_members);

    var response = {};
    response.count = 0;
    
    staff_blob_results.forEach(function(blob) {
        response[blob.name] = blob.totalSize;
        response.count++;
    });
    public_blob_results.forEach(function(blob) {
        response[blob.name] = blob.totalSize;
        response.count++;
    });

    return {
        status: 200,
        body: JSON.stringify(response)
    };

    async function parseStaffMembers(members) {
        var create_blob_results = [];

        Object.getOwnPropertyNames(members).forEach(async function (group_slug) {
            var blob_name = requested_school_code +'-'+ group_slug +'@wrdsb.ca.json';
            var memberships = JSON.stringify(members[group_slug]);
            var result = await createBlob(container, blob_name, memberships);
            create_blob_results.push(result);
        });

        return create_blob_results;
    }

    async function parsePublicMembers(members) {
        var create_blob_results = [];

        var blob_name = requested_school_code +'@wrdsb.ca.json';
        var memberships = JSON.stringify(members);
        var result = await createBlob(container, blob_name, memberships);
        create_blob_results.push(result);

        return create_blob_results;
    }

    async function createBlob(container, blob_name, memberships) {
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
        members['staff'] = {};
        members['staff-discussion'] = {};
        members['admin'] = {};
        members['attendance'] = {};
        members['beforeafter'] = {};
        members['easyconnect'] = {};
        members['itunes'] = {};
        members['office'] = {};
        members['orders'] = {};
        members['registrations'] = {};
        members['s4s'] = {};
        members['stswr'] = {};
        members['its'] = {};
    
        var public_members = {};

        rows.forEach(function(row) {
            if (row.EMAIL_ADDRESS
                && !excluded_job_codes.includes(row.JOB_CODE)
                && activity_codes.includes(row.ACTIVITY_CODE)
                && isNaN(row.SCHOOL_CODE)
                && requested_school_code == row.SCHOOL_CODE.toLowerCase()
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

                if (admin_job_codes.includes(job_code)) {
                    members['staff'][email] = {
                        email:          email,
                        role:           "MANAGER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-staff@wrdsb.ca'
                    };
                } else {
                    members['staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-staff@wrdsb.ca'
                    };
                }
        
                if (office_job_codes.includes(job_code)) {
                    members['staff-discussion'][email] = {
                        email:          email,
                        role:           "MANAGER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-staff-discussion@wrdsb.ca'
                    };
                }
            
                if (admin_job_codes.includes(job_code)) {
                    members['admin'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-admin@wrdsb.ca'
                    };
                }
            
                if (attendance_job_codes.includes(job_code)) {
                    members['attendance'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-attendance@wrdsb.ca'
                    };
                }
            
                if (beforeafter_job_codes.includes(job_code)) {
                    members['beforeafter'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-beforeafter@wrdsb.ca'
                    };
                }
            
                if (easyconnect_job_codes.includes(job_code)) {
                    members['easyconnect'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-easyconnect@wrdsb.ca'
                    };
                }
            
                if (its_job_codes.includes(job_code)) {
                    members['its'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-its@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members['itunes'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-itunes@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members['office'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-office@wrdsb.ca'
                    };
                }
            
                if (orders_job_codes.includes(job_code)) {
                    members['orders'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-orders@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members['registrations'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-registrations@wrdsb.ca'
                    };
                }
            
                if (s4s_job_codes.includes(job_code)) {
                    members['s4s'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-s4s@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members['stswr'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-stswr@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    public_members[email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '@wrdsb.ca'
                    };
                }
            }
        });
        return [members, public_members];

    }
}

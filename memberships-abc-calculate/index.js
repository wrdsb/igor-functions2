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

        Object.getOwnPropertyNames(members).forEach(async function (school_code) {
            Object.getOwnPropertyNames(members[school_code]).forEach(async function (group_slug) {
                var blob_name = school_code +'-'+ group_slug +'@wrdsb.ca.json';
                var memberships = JSON.stringify(members[school_code][group_slug]);
                var result = await createBlob(container, blob_name, memberships);
                create_blob_results.push(result);
            });
        });

        return create_blob_results;
    }

    async function parsePublicMembers(members) {
        var create_blob_results = [];

        Object.getOwnPropertyNames(members).forEach(async function (school_code) {
            var blob_name = school_code +'@wrdsb.ca.json';
            var memberships = JSON.stringify(members[school_code]);
            var result = await createBlob(container, blob_name, memberships);
            create_blob_results.push(result);
        });

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
        var public_members = {};

        rows.forEach(function(row) {
            if (row.EMAIL_ADDRESS
                && !excluded_job_codes.includes(row.JOB_CODE)
                && activity_codes.includes(row.ACTIVITY_CODE)
                && isNaN(row.SCHOOL_CODE)
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

                if (!members[school_code]) {
                    members[school_code] = {};
                
                    members[school_code]['staff'] = {};
                    members[school_code]['staff-discussion'] = {};
                    members[school_code]['admin'] = {};
                    members[school_code]['attendance'] = {};
                    members[school_code]['beforeafter'] = {};
                    members[school_code]['easyconnect'] = {};
                    members[school_code]['itunes'] = {};
                    members[school_code]['office'] = {};
                    members[school_code]['orders'] = {};
                    members[school_code]['registrations'] = {};
                    members[school_code]['s4s'] = {};
                    members[school_code]['stswr'] = {};
                    members[school_code]['its'] = {};
                }
            
                if (!public_members[school_code]) {
                    public_members[school_code] = {};
                }

                if (admin_job_codes.includes(job_code)) {
                    members[school_code]['staff'][email] = {
                        email:          email,
                        role:           "MANAGER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-staff@wrdsb.ca'
                    };
                } else {
                    members[school_code]['staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-staff@wrdsb.ca'
                    };
                }
        
                if (office_job_codes.includes(job_code)) {
                    members[school_code]['staff-discussion'][email] = {
                        email:          email,
                        role:           "MANAGER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-staff-discussion@wrdsb.ca'
                    };
                }
            
                if (admin_job_codes.includes(job_code)) {
                    members[school_code]['admin'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-admin@wrdsb.ca'
                    };
                }
            
                if (attendance_job_codes.includes(job_code)) {
                    members[school_code]['attendance'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-attendance@wrdsb.ca'
                    };
                }
            
                if (beforeafter_job_codes.includes(job_code)) {
                    members[school_code]['beforeafter'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-beforeafter@wrdsb.ca'
                    };
                }
            
                if (easyconnect_job_codes.includes(job_code)) {
                    members[school_code]['easyconnect'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-easyconnect@wrdsb.ca'
                    };
                }
            
                if (its_job_codes.includes(job_code)) {
                    members[school_code]['its'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-its@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members[school_code]['itunes'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-itunes@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members[school_code]['office'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-office@wrdsb.ca'
                    };
                }
            
                if (orders_job_codes.includes(job_code)) {
                    members[school_code]['orders'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-orders@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members[school_code]['registrations'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-registrations@wrdsb.ca'
                    };
                }
            
                if (s4s_job_codes.includes(job_code)) {
                    members[school_code]['s4s'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-s4s@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    members[school_code]['stswr'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       school_code + '-stswr@wrdsb.ca'
                    };
                }
            
                if (office_job_codes.includes(job_code)) {
                    public_members[school_code][email] = {
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

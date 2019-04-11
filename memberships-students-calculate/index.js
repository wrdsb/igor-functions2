module.exports = async function (context) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z
    var students = context.bindings.studentsNow;

    var container = 'groups-memberships-trillium-now';

    var azure = require('azure-storage');
    var blobService = azure.createBlobService(
        'wrdsbigor',
        process.env['wrdsbigor_STORAGE_KEY']
    );

    var calculated_members = await calculateMembers(students);

    var membership_blob_results = await parseMembers(calculated_members);

    var response = {};
    response.count = 0;
    
    membership_blob_results.forEach(function(blob) {
        response[blob.name] = blob.totalSize;
        response.count++;
    });

    return {
        status: 200,
        body: JSON.stringify(response)
    };

    async function parseMembers(members) {
        var create_blob_results = [];

        Object.getOwnPropertyNames(members).forEach(async function (group_slug) {
            var blob_name = group_slug + '-students@wrdsb.ca.json';
            var memberships = JSON.stringify(members[group_slug]);
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

    async function calculateMembers (students) {
        var members = {};

        students.forEach(function(student) {
            if (student.student_email) {
                var email = (student.student_email) ? student.student_email : '';
                var school_code = (student.school_code) ? student.school_code.toLowerCase() : '';
                var oyap = (student.student_oyap === 'Y') ? true : false;

                if (!members[school_code]) {
                    members[school_code] = {};
                }
                if (!members['oyap']) {
                    members['oyap'] = {};
                }

                members[school_code][email] = {
                    email:          email,
                    role:           "MEMBER",
                    status:         "ACTIVE",
                    type:           "USER",
                    groupKey:       school_code + '-students@wrdsb.ca'
                };
        
                if (oyap) {
                    members['oyap'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'oyap-students@wrdsb.ca'
                    };
                }
            }
        });
        return members;
    }
}

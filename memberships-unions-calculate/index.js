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

    var cama_group_codes = context.bindings.camaGroupCodes.group_codes;
    var cyw_job_codes = context.bindings.cywJobCodes.job_codes;
    var dece_group_codes = context.bindings.deceGroupCodes.group_codes;
    var dece_excluded_job_codes = context.bindings.deceExcludedJobCodes.job_codes;
    var dece_observer_job_codes = context.bindings.deceObserverJobCodes.job_codes;
    var eaa_group_codes = context.bindings.eaaGroupCodes.group_codes;
    var eaa_excluded_job_codes = context.bindings.eaaExcludedJobCodes.job_codes;
    var ess_group_codes = context.bindings.essGroupCodes.group_codes;
    var etfo_group_codes = context.bindings.etfoGroupCodes.group_codes;
    var osstf_contract_group_codes = context.bindings.osstfContractGroupCodes.group_codes;
    var osstf_ot_group_codes = context.bindings.osstfOtGroupCodes.group_codes;
    var pssp_group_codes = context.bindings.psspGroupCodes.group_codes;
    var smaca_group_codes = context.bindings.smacaGroupCodes.group_codes;
    var smaca_elementary_group_codes = context.bindings.smacaElementaryGroupCodes.group_codes;
    var smaca_secondary_group_codes = context.bindings.smacaSecondaryGroupCodes.group_codes;

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
              
                if (cama_group_codes.includes(group_code)) {
                    if (!members['cama']) {
                        members['cama'] = {};
                    }
                    members['cama'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'cama@wrdsb.ca'
                    };
                }

                if (cyw_job_codes.includes(job_code)) {
                    if (!members['cyw']) {
                        members['cyw'] = {};
                    }
                    members['cyw'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'cyw@wrdsb.ca'
                    };
                }

                if (cyw_job_codes.includes(job_code) && panel == 'E') {
                    if (!members['cyw-elementary']) {
                        members['cyw-elementary'] = {};
                    }
                    members['cyw-elementary'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'cyw-elementary@wrdsb.ca'
                    };
                }

                if (cyw_job_codes.includes(job_code) && panel == 'S') {
                    if (!members['cyw-secondary']) {
                        members['cyw-secondary'] = {};
                    }
                    members['cyw-secondary'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'cyw-secondary@wrdsb.ca'
                    };
                }
        
                //if (dece_group_codes.includes(group_code) && !dece_excluded_job_codes.includes(job_code)) {
                    //if (!members['dece']) {
                        //members['dece'] = {};
                    //}
                    //members['dece'][email] = {
                        //email:          email,
                        //role:           "MEMBER",
                        //status:         "ACTIVE",
                        //type:           "USER",
                        //groupKey:       'dece@wrdsb.ca'
                    //};
                //}

                if (dece_group_codes.includes(group_code) && !dece_excluded_job_codes.includes(job_code)) {
                    if (!members['dece-info']) {
                        members['dece-info'] = {};
                    }
                    members['dece-info'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'dece-info@wrdsb.ca'
                    };
                }

                if (dece_observer_job_codes.includes(job_code)) {
                    if (!members['dece-info']) {
                        members['dece-info'] = {};
                    }
                    members['dece-info'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'dece-info@wrdsb.ca'
                    };
                }

                if (eaa_group_codes.includes(group_code) && !eaa_excluded_job_codes.includes(job_code)) {
                    if (!members['eaa']) {
                        members['eaa'] = {};
                    }
                    members['eaa'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'eaa@wrdsb.ca'
                    };
                    if (panel == 'E') {
                        if (!members['eaa-elementary']) {
                            members['eaa-elementary'] = {};
                        }
                        members['eaa-elementary'][email] = {
                            email:          email,
                            role:           "MEMBER",
                            status:         "ACTIVE",
                            type:           "USER",
                            groupKey:       'eaa-elementary@wrdsb.ca'
                        };
                    }
                    if (panel == 'S') {
                        if (!members['eaa-secondary']) {
                            members['eaa-secondary'] = {};
                        }
                        members['eaa-secondary'][email] = {
                            email:          email,
                            role:           "MEMBER",
                            status:         "ACTIVE",
                            type:           "USER",
                            groupKey:       'eaa-secondary@wrdsb.ca'
                        };
                    }
                }

                if (ess_group_codes.includes(group_code)) {
                    if (!members['ess']) {
                        members['ess'] = {};
                    }
                    members['ess'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'ess@wrdsb.ca'
                    };
                }

                if (etfo_group_codes.includes(group_code)) {
                    if (!members['etfo']) {
                        members['etfo'] = {};
                    }
                    members['etfo'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'etfo@wrdsb.ca'
                    };
                }

                if (osstf_contract_group_codes.includes(group_code)) {
                    if (!members['osstf-contract']) {
                        members['osstf-contract'] = {};
                    }
                    members['osstf-contract'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'osstf-contract@wrdsb.ca'
                    };
                }

                if (osstf_ot_group_codes.includes(group_code)) {
                    if (!members['osstf-ot']) {
                        members['osstf-ot'] = {};
                    }
                    members['osstf-ot'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'osstf-ot@wrdsb.ca'
                    };
                }

                if (pssp_group_codes.includes(group_code)) {
                    if (!members['pssp']) {
                        members['pssp'] = {};
                    }
                    members['pssp'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'pssp@wrdsb.ca'
                    };
                }

                if (smaca_group_codes.includes(group_code)) {
                    if (!members['smaca']) {
                        members['smaca'] = {};
                    }
                    members['smaca'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'smaca@wrdsb.ca'
                    };
                }

                if (smaca_elementary_group_codes.includes(group_code) && panel == 'E') {
                    if (!members['smaca-elementary']) {
                        members['smaca-elementary'] = {};
                    }
                    members['smaca-elementary'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'smaca-elementary@wrdsb.ca'
                    };
                }

                if (smaca_secondary_group_codes.includes(group_code) && panel == 'S') {
                    if (!members['smaca-secondary']) {
                        members['smaca-secondary'] = {};
                    }
                    members['smaca-secondary'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'smaca-secondary@wrdsb.ca'
                    };
                }
            }
        });
        return members;
    }
}

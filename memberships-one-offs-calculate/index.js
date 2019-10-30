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

    var admissions_qna_job_codes = context.bindings.admissionsQnaJobCodes.job_codes;
    var dece_staff_group_codes = context.bindings.deceStaffGroupCodes.group_codes;
    var ea_staff_job_codes = context.bindings.eaStaffJobCodes.job_codes;
    var ed_deployment_manager_job_codes = context.bindings.edDeploymentManagerJobCodes.job_codes;
    var ed_deployment_member_job_codes = context.bindings.edDeploymentMemberJobCodes.job_codes;
    var ed_inquiries_job_codes = context.bindings.edInquiriesJobCodes.job_codes;
    var edc_location_codes = context.bindings.edcLocationCodes.location_codes;
    var elementary_serts_job_codes = context.bindings.elementarySertsJobCodes.job_codes;
    var finance_job_codes = context.bindings.financeJobCodes.job_codes;
    var finance_location_codes = context.bindings.financeLocationCodes.location_codes;
    var grc_health_safety_location_codes = context.bindings.grcHealthSafetyLocationCodes.location_codes;
    var itinerant_spec_ed_job_codes = context.bindings.itinerantSpecEdJobCodes.job_codes;
    var itinerant_spec_ed_location_codes = context.bindings.itinerantSpecEdLocationCodes.location_codes;
    var its_job_codes = context.bindings.itsJobCodes.job_codes;
    var its_location_codes = context.bindings.itsLocationCodes.job_codes;
    var its_staff_managers_job_codes = context.bindings.itsManagerCodes.job_codes;
    var procurement_qna_job_codes = context.bindings.procurementQnaJobCodes.job_codes;
    var psychologists_job_codes = context.bindings.psychologistsJobCodes.job_codes;
    var risk_job_codes = context.bindings.riskJobCodes.job_codes;
    var school_day_job_codes = context.bindings.schoolDayJobCodes.job_codes;
    var secondary_serts_job_codes = context.bindings.secondarySertsJobCodes.job_codes;
    var smaca_elementary_group_codes = context.bindings.smacaElementaryGroupCodes.group_codes;
    var smaca_secondary_group_codes = context.bindings.smacaSecondaryGroupCodes.group_codes;
    var social_workers_job_codes = context.bindings.socialWorkersJobCodes.job_codes;
    var special_education_location_codes = context.bindings.specialEducationLocationCodes.location_codes;
    var special_education_consultants_job_codes = context.bindings.specialEducationConsultantsJobCodes.job_codes;
    var speech_language_job_codes = context.bindings.speechLanguageJobCodes.job_codes;
    var system_leaders_job_codes = context.bindings.systemLeadersJobCodes.job_codes;
    var thr_message_board_job_codes = context.bindings.thrMessageBoardJobCodes.job_codes;
    var twea_job_codes = context.bindings.tweaJobCodes.job_codes;
    var wrdsb_managers_job_codes = context.bindings.wrdsbManagersJobCodes.job_codes;

    var intranet_its_location_codes = context.bindings.itsJobCodes.job_codes;
    var intranet_library_job_codes = context.bindings.intranetLibraryJobCodes.job_codes;
    var intranet_trillium_job_codes = context.bindings.intranetTrilliumJobCodes.job_codes;

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

                if (admissions_qna_job_codes.includes(job_code)) {
                    if (!members['admissions-qna']) {
                        members['admissions-qna'] = {};
                    }
                    members['admissions-qna'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "admissions-qna@wrdsb.ca"
                    };
                }
                if (dece_staff_group_codes.includes(group_code)) {
                    if (!members['dece-staff']) {
                        members['dece-staff'] = {};
                    }
                    members['dece-staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "dece-staff@wrdsb.ca"
                    };
                }
                if (ea_staff_job_codes.includes(job_code)) {
                    if (!members['ea-staff']) {
                        members['ea-staff'] = {};
                    }
                    members['ea-staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "ea-staff@wrdsb.ca"
                    };
                }
                if (ed_deployment_manager_job_codes.includes(job_code)) {
                    if (!members['ed-deployment']) {
                        members['ed-deployment'] = {};
                    }
                    members['ed-deployment'][email] = {
                        email:          email,
                        role:           "MANAGER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "ed-deployment@wrdsb.ca"
                    };
                }
                if (ed_deployment_member_job_codes.includes(job_code)) {
                    if (!members['ed-deployment']) {
                        members['ed-deployment'] = {};
                    }
                    members['ed-deployment'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "ed-deployment@wrdsb.ca"
                    };
                }
                if (ed_inquiries_job_codes.includes(job_code)) {
                    if (!members['ed-inquiries']) {
                        members['ed-inquiries'] = {};
                    }
                    members['ed-inquiries'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "ed-inquiries@wrdsb.ca"
                    };
                }
                if (edc_location_codes.includes(location_code)) {
                    if (!members['edc-staff']) {
                        members['edc-staff'] = {};
                    }
                    members['edc-staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'edc-staff@wrdsb.ca'
                    };
                }
                if (elementary_serts_job_codes.includes(job_code) && panel == 'E') {
                    if (!members['elementary-serts']) {
                        members['elementary-serts'] = {};
                    }
                    members['elementary-serts'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "elementary-serts@wrdsb.ca"
                    };
                }
                if (finance_job_codes.includes(job_code)) {
                    if (!members['finance-staff']) {
                        members['finance-staff'] = {};
                    }
                    members['finance-staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'finance-staff@wrdsb.ca'
                    };
                }
                if (finance_location_codes.includes(location_code)) {
                    if (!members['finance-staff']) {
                        members['finance-staff'] = {};
                    }
                    members['finance-staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'finance-staff@wrdsb.ca'
                    };
                }
                if (grc_health_safety_location_codes.includes(location_code)) {
                    if (!members['grc-health-safety']) {
                        members['grc-health-safety'] = {};
                    }
                    members['grc-health-safety'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'grc-health-safety@wrdsb.ca'
                    };
                }
                //if (intranet_its_job_codes.includes(job_code)) {
                    //if (!members['intranet-its']) {
                        //members['intranet-its'] = {};
                    //}
                    //members['intranet-its'][email] = {
                        //email:          email,
                        //role:           "MEMBER",
                        //status:         "ACTIVE",
                        //type:           "USER",
                        //groupKey:       'intranet-its@wrdsb.ca'
                    //};
                //}
                if (intranet_library_job_codes.includes(job_code)) {
                    if (!members['intranet-library']) {
                        members['intranet-library'] = {};
                    }
                    members['intranet-library'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "intranet-library@wrdsb.ca"
                    };
                }
                if (elementary_serts_job_codes.includes(job_code) && panel == 'E') {
                    if (!members['intranet-special-education']) {
                        members['intranet-special-education'] = {};
                    }
                    members['intranet-special-education'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "intranet-special-education@wrdsb.ca"
                    };
                }
                if (secondary_serts_job_codes.includes(job_code) && panel == 'S') {
                    if (!members['intranet-special-education']) {
                        members['intranet-special-education'] = {};
                    }
                    members['intranet-special-education'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "intranet-special-education@wrdsb.ca"
                    };
                }
                if (special_education_consultants_job_codes.includes(job_code)) {
                    if (!members['intranet-special-education']) {
                        members['intranet-special-education'] = {};
                    }
                    members['intranet-special-education'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "intranet-special-education@wrdsb.ca"
                    };
                }
                if (intranet_trillium_job_codes.includes(job_code)) {
                    if (!members['intranet-trillium']) {
                        members['intranet-trillium'] = {};
                    }
                    members['intranet-trillium'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "intranet-trillium@wrdsb.ca"
                    };
                }
                if (itinerant_spec_ed_job_codes.includes(job_code) && itinerant_spec_ed_location_codes.includes(location_code)) {
                    if (!members['itinerant-spec-ed']) {
                        members['itinerant-spec-ed'] = {};
                    }
                    members['itinerant-spec-ed'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "itinerant-spec-ed@wrdsb.ca"
                    };
                }
                if (its_job_codes.includes(job_code)) {
                    if (!members['its-staff']) {
                        members['its-staff'] = {};
                    }
                    members['its-staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'its-staff@wrdsb.ca'
                    };
                }
                if (its_location_codes.includes(location_code)) {
                    if (!members['its-staff']) {
                        members['its-staff'] = {};
                    }
                    members['its-staff'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'its-staff@wrdsb.ca'
                    };
                }
                if (its_staff_managers_job_codes.includes(job_code)) {
                    if (!members['its-staff']) {
                        members['its-staff'] = {};
                    }
                    members['its-staff'][email] = {
                        email:          email,
                        role:           "MANAGER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'its-staff@wrdsb.ca'
                    };
                }
                if (procurement_qna_job_codes.includes(job_code)) {
                    if (!members['procurement-qna']) {
                        members['procurement-qna'] = {};
                    }
                    members['procurement-qna'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "procurement-qna@wrdsb.ca"
                    };
                }
                if (psychologists_job_codes.includes(job_code)) {
                    if (!members['psychologists']) {
                        members['psychologists'] = {};
                    }
                    members['psychologists'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "psychologists@wrdsb.ca"
                    };
                }
                if (risk_job_codes.includes(job_code)) {
                    if (!members['risk']) {
                        members['risk'] = {};
                    }
                    members['risk'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "risk@wrdsb.ca"
                    };
                }
                if (school_day_job_codes.includes(job_code)) {
                    if (!members['school-day']) {
                        members['school-day'] = {};
                    }
                    members['school-day'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "school-day@wrdsb.ca"
                    };
                }
                if (secondary_serts_job_codes.includes(job_code) && panel == 'S') {
                    if (!members['secondary-serts']) {
                        members['secondary-serts'] = {};
                    }
                    members['secondary-serts'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "secondary-serts@wrdsb.ca"
                    };
                }
                if (smaca_elementary_group_codes.includes(group_code) && panel == 'E') {
                    if (!members['smaca-elementary-qna']) {
                        members['smaca-elementary-qna'] = {};
                    }
                    members['smaca-elementary-qna'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'smaca-elementary-qna@wrdsb.ca'
                    };
                }
                if (smaca_secondary_group_codes.includes(group_code) && panel == 'S') {
                    if (!members['smaca-secondary-qna']) {
                        members['smaca-secondary-qna'] = {};
                    }
                    members['smaca-secondary-qna'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'smaca-secondary-qna@wrdsb.ca'
                    }
                }
                if (social_workers_job_codes.includes(job_code)) {
                    if (!members['social-workers']) {
                        members['social-workers'] = {};
                    }
                    members['social-workers'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "social-workers@wrdsb.ca"
                    };
                }
                if (special_education_location_codes.includes(location_code)) {
                    if (!members['special-education']) {
                        members['special-education'] = {};
                    }
                    members['special-education'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "special-education@wrdsb.ca"
                    };
                }
                if (special_education_consultants_job_codes.includes(job_code)) {
                    if (!members['special-education-consultants']) {
                        members['special-education-consultants'] = {};
                    }
                    members['special-education-consultants'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "special-education-consultants@wrdsb.ca"
                    };
                }
                if (speech_language_job_codes.includes(job_code)) {
                    if (!members['speech-language']) {
                        members['speech-language'] = {};
                    }
                    members['speech-language'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "speech-language@wrdsb.ca"
                    };
                }
                if (system_leaders_job_codes.includes(job_code)) {
                    if (!members['system-leaders']) {
                        members['system-leaders'] = {};
                    }
                    members['system-leaders'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       'system-leaders@wrdsb.ca'
                    };
                }
                if (thr_message_board_job_codes.includes(job_code)) {
                    if (!members['thr-message-board']) {
                        members['thr-message-board'] = {};
                    }
                    members['thr-message-board'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "thr-message-board@wrdsb.ca"
                    };
                }
                if (twea_job_codes.includes(job_code)) {
                    if (!members['twea']) {
                        members['twea'] = {};
                    }
                    members['twea'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "twea@wrdsb.ca"
                    };
                }
                if (wrdsb_managers_job_codes.includes(job_code)) {
                    if (!members['wrdsb-managers']) {
                        members['wrdsb-managers'] = {};
                    }
                    members['wrdsb-managers'][email] = {
                        email:          email,
                        role:           "MEMBER",
                        status:         "ACTIVE",
                        type:           "USER",
                        groupKey:       "wrdsb-managers@wrdsb.ca"
                    };
                }
            }
        });
        return members;
    }
}

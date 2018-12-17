module.exports = function (context, req) {
    var azure = require('azure-storage');

    var igorBlobService = azure.createBlobService(
        'wrdsbigor',
        process.env['wrdsbigor_STORAGE_KEY']
    );

    var group = '';

    var igor_containers = [];
    igor_containers.push('groups-memberships-actual-changes');
    igor_containers.push('groups-memberships-actual-now');
    igor_containers.push('groups-memberships-actual-previous');
    igor_containers.push('groups-memberships-differences');
    igor_containers.push('groups-memberships-ideal-changes');
    igor_containers.push('groups-memberships-ideal-now');
    igor_containers.push('groups-memberships-ideal-previous');
    igor_containers.push('groups-memberships-ipps-changes');
    igor_containers.push('groups-memberships-ipps-now');
    igor_containers.push('groups-memberships-ipps-previous');

    if (!req.body.group) {
        context.res = {
            status: 400,
            body: "Please pass a group email address in the request body."
        };
    } else {
        group = req.body.group;

        var groups_memberships_overrides_doc = {
            "central": {},
            "group": group,
            "id": group
        };

        sendEmptyFileToBlobStorage(group);

        context.bindings.groupsMembershipsOverridesOut = groups_memberships_overrides_doc;

        context.res = {
            status: 200,
            body: "Empty blobs and Cosmos doc created."
        };

        context.done(null, group);
    }

    function sendEmptyFileToBlobStorage(group) {
        igor_containers.forEach(function(container) {
            var blob_name = group + '.json';
            var memberships = {};
            memberships = JSON.stringify(memberships);
      
            igorBlobService.createBlockBlobFromText(container, blob_name, memberships, function(error, result, response) {
            if (!error) {
                context.log(blob_name + ' uploaded');
                context.log(result);
                context.log(response);
            } else {
                context.log(error);
            }
          });
        });
    }
};

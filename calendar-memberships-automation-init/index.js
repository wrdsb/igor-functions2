module.exports = function (context, req) {
    var azure = require('azure-storage');

    var igorBlobService = azure.createBlobService(
        'wrdsbigor',
        process.env['wrdsbigor_STORAGE_KEY']
    );

    var calendar = '';

    var igor_containers = [];
    igor_containers.push('calendar-memberships-actual-changes');
    igor_containers.push('calendar-memberships-actual-now');
    igor_containers.push('calendar-memberships-actual-previous');
    igor_containers.push('calendar-memberships-differences');
    igor_containers.push('calendar-memberships-ideal-changes');
    igor_containers.push('calendar-memberships-ideal-now');
    igor_containers.push('calendar-memberships-ideal-previous');
    igor_containers.push('calendar-memberships-ipps-changes');
    igor_containers.push('calendar-memberships-ipps-now');
    igor_containers.push('calendar-memberships-ipps-previous');

    if (!req.body.calendar) {
        context.res = {
            status: 400,
            body: "Please pass a calendar id in the request body."
        };
    } else {
        calendar = req.body.calendar;

        var calendar_memberships_overrides_doc = {
            "central": {},
            "calendar": calendar,
            "id": calendar
        };

        sendEmptyFileToBlobStorage(calendar);

        context.bindings.calendarMembershipsOverridesOut = calendar_memberships_overrides_doc;

        context.res = {
            status: 200,
            body: "Empty blobs and Cosmos doc created."
        };

        context.done(null, calendar);
    }

    function sendEmptyFileToBlobStorage(calendar) {
        igor_containers.forEach(function(container) {
            var blob_name = calendar + '.json';
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

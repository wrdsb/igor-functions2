module.exports = function (context, req) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z

    var site_name   = req.body.site.name;
    var group_email = `intranet-${req.body.site.slug}@wrdsb.ca`;
    var group_name  = `${req.body.site.name} Notifications`;

    var group_to_create = {
        adminCreated: "true",
        includeCustomFooter: "true",
        sendMessageDenyNotification: "true",
        kind: "groupsSettings#groups",
        whoCanJoin: "INVITED_CAN_JOIN",
        whoCanViewMembership: "ALL_MANAGERS_CAN_VIEW",
        whoCanViewGroup: "ALL_MEMBERS_CAN_VIEW",
        whoCanInvite: "ALL_MANAGERS_CAN_INVITE",
        whoCanAdd: "ALL_MANAGERS_CAN_ADD",
        allowExternalMembers: "false",
        whoCanPostMessage: "ALL_MANAGERS_CAN_POST",
        allowWebPosting: "false",
        primaryLanguage: "en",
        maxMessageBytes: 26214400,
        isArchived: "true",
        archiveOnly: "false",
        messageModerationLevel: "MODERATE_NONE",
        spamModerationLevel: "ALLOW",
        replyTo: "REPLY_TO_LIST",
        showInGroupDirectory: "false",
        allowGoogleCommunication: "false",
        membersCanPostAsTheGroup: "false",
        messageDisplayFont: "DEFAULT_FONT",
        includeInGlobalAddressList: "false",
        whoCanLeaveGroup: "NONE_CAN_LEAVE",
        whoCanContactOwner: "ALL_MANAGERS_CAN_CONTACT",
        whoCanAddReferences: "NONE",
        whoCanAssignTopics: "NONE",
        whoCanUnassignTopic: "NONE",
        whoCanTakeTopics: "NONE",
        whoCanMarkDuplicate: "NONE",
        whoCanMarkNoResponseNeeded: "NONE",
        whoCanMarkFavoriteReplyOnAnyTopic: "NONE",
        whoCanMarkFavoriteReplyOnOwnTopic: "NONE",
        whoCanUnmarkFavoriteReplyOnAnyTopic: "NONE",
        whoCanEnterFreeFormTags: "NONE",
        whoCanModifyTagsAndCategories: "NONE",
        favoriteRepliesOnTop: "false"
    };

    group_to_create.email = group_email;
    group_to_create.customReplyTo = group_email;
    group_to_create.name = group_name;
    group_to_create.description = `A private group for notifications from ${site_name}.`;
    group_to_create.customFooterText = "";
    group_to_create.defaultMessageDenyNotificationText = `You do not have permission to send messages to the Google Group "${group_name}". `
        + 'This Group is for one-way notifications only. '
        + 'If you were trying to reply to a message you received via this Group, please send your reply to a different email address.';

    context.log('Create group: ' + group_to_create.email);

    var series = require('async/series');

    var google = require('googleapis');
    var directory = google.admin('directory_v1');
    var groupssettings = google.groupssettings('v1');

    var client_email = process.env.client_email;
    var private_key = process.env.private_key;
    var user_address = 'igor@wrdsb.ca';

    // *sigh* because Azure Functions application settings can't handle newlines, let's add them ourselves:
    private_key = private_key.split('\\n').join("\n");

    // stores our group in the end
    var group_created = {};

    // prep our credentials for G Suite APIs
    var jwtClient = new google.auth.JWT(
        client_email,
        null,
        private_key,
        ['https://www.googleapis.com/auth/admin.directory.group','https://www.googleapis.com/auth/apps.groups.settings'], // an array of auth scopes
        user_address
    );

    var params = {
        auth: jwtClient,

        // specify we want JSON back from the API.
        // Group Settings API defaults to XML (or Atom), despite the docs
        alt: "json",

        // the Group to create
        resource: group_to_create,
        groupUniqueId: group_to_create.email
    };

    jwtClient.authorize(function(err, tokens) {
        if (err) {
            context.res = {
                status: 500,
                body: err
            };
            context.done(err);
            return;
        }
        series([
            function createGroup(createGroupCallback) {
                directory.groups.insert(params, function (err, result) {
                    if (err) {
                        context.log(result);
                        createGroupCallback(new Error(err));
                        return;
                    }
                    context.log(result);
                    createGroupCallback(null, result);
                });
            },
            function createGroupSettings(createGroupSettingsCallback) {
                groupssettings.groups.update(params, function (err, result) {
                    if (err) {
                        context.log(result);
                        createGroupSettingsCallback(new Error(err));
                        return;
                    }
                    context.log(result);
                    createGroupSettingsCallback(null, result);
                });
            }
        ],
        function (err, results) {
            if (err) {
                context.res = {
                    status: 500,
                    body: err
                };
                context.done(err);
                return;
            } else {
                group_created = Object.assign(results[0], results[1]);
                var message = "Created group "+ group_created.email;
                var event_type = "ca.wrdsb.igor.google_group.create";
                var flynn_event = {
                    eventID: `${event_type}-${context.executionContext.invocationId}`,
                    eventType: event_type,
                    source: `/google/group/${group_created.email}/create`,
                    schemaURL: "https://mcp.wrdsb.io/schemas/igor/group_create-event.json",
                    extensions: { 
                        label: "IGOR creates Google Group", 
                        tags: [
                            "igor", 
                            "google_group",
                            "google_groups",
                            "create"
                        ] 
                    },
                    data: {
                        function_name: context.executionContext.functionName,
                        invocation_id: context.executionContext.invocationId,
                        payload: group_created,
                        message: message
                    },
                    eventTime: execution_timestamp,
                    eventTypeVersion: "0.1",
                    cloudEventsVersion: "0.1",
                    contentType: "application/json"
                };

                context.res = {
                    status: 200,
                    body: flynn_event.data
                };

                context.log(message);
                context.done(null, message);
            }
        });
    });
};

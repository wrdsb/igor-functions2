module.exports = function (context, data) {
    var execution_timestamp = (new Date()).toJSON();  // format: 2012-04-23T18:25:43.511Z

    var igorRecord = context.bindings.igorRecordIn;

    var group = data.body.group;
    var scope = data.body.scope;
    var operation = data.body.operation;
    var membership = data.body.membership;
    var user = membership.email;

    if (!igorRecord) {
        igorRecord = {
            id: group,
            group: group,
            central: {}
        };
    }

    if (!igorRecord[scope]) {
        igorRecord[scope] = {};
    }

    switch (operation) {
        case 'add':
            igorRecord[scope][user] = membership;

            igorRecord[scope][user].created_at = execution_timestamp;
            igorRecord[scope][user].fetched_at = '';
            igorRecord[scope][user].updated_at = '';
            igorRecord[scope][user].deleted_at = '';
            igorRecord[scope][user].deleted = false;
            break;

        case 'update':
            igorRecord[scope][user].email = membership.email;
            igorRecord[scope][user].groupKey = membership.groupKey;
            igorRecord[scope][user].role = membership.role;
            igorRecord[scope][user].status = membership.status;
            igorRecord[scope][user].type = membership.type;

            igorRecord[scope][user].updated_at = execution_timestamp;
            igorRecord[scope][user].deleted_at = '';
            igorRecord[scope][user].deleted = false;
            break;

        case 'delete':
            igorRecord[scope][user].deleted_at = execution_timestamp;
            igorRecord[scope][user].deleted = true;
            break;

        default:
            break;
    }
    
    context.bindings.igorRecordOut = igorRecord;
    context.res = {
        status: 200,
        body: igorRecord
    };
    context.done(null, `Updated membership override in ${group}`);
};

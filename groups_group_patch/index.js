module.exports = function (context, data) {
    var current_record;
    var merged_record;

    context.log(data);

    // TODO: Fail if data does not include email

    // We use the Group's email address as the Cosmos DB record's id
    // and store the 'real' id as google_id.
    // So, if we have an id, and it's not an email address,
    // move it into the google_id, and replace it with the email address
    if (data.id && data.id.indexOf('@') == -1) {
        data.google_id = data.id;
        data.id = data.email;
    }
    
    // Get the current record from Codex
    current_record = context.bindings.codexRecordIn;
    context.log(current_record);

    if (current_record) {
        // Merge request object into current record
        merged_record = Object.assign(current_record, data);
    } else {
        merged_record = data;
    }
    context.log(merged_record);

    context.bindings.codexRecordOut = merged_record;

    context.done();
};

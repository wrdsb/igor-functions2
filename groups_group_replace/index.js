module.exports = function (context, data) {
    context.log(data);

    // Fail if data does not include email

    // We use the Group's email address as the Cosmos DB record's id
    // and store the 'real' id as google_id.
    // So, if we have an id, and it's not an email address,
    // move it into the google_id, and replace it with the email address
    if (data.id && data.indexOf('@') == -1) {
        data.google_id = data.id;
        data.id = data.email;
    }

    // Simply write data to database, regardless of what might already be there    
    context.bindings.codexRecordOut = data;

    context.done();
};

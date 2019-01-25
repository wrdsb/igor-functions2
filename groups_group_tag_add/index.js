module.exports = function (context, data) {
    var new_tag = data.tag;
    var current_record;
    var current_tags;
    var updated_tags;
    var updated_record;

    context.log(data);

    // TODO: Fail if data does not include id

    // Get the current record from Codex
    current_record = context.bindings.codexRecordIn;

    if (current_record) {
        context.log(current_record);

        // Get current record's categories
        current_tags = current_record["tags"];

        if (current_tags && Array.isArray(current_tags)) {
            if (current_tags.indexOf(new_tag) === -1) {
                updated_tags = current_tags;
                updated_tags.push(new_tag);
            } else {
                updated_tags = current_tags;
            }
        } else {
            updated_tags = [new_tag];
        }
        
        // Merge categories array back into current record
        current_record["tags"] = updated_tags;

        // Merge request object into current record
        updated_record = Object.assign(current_record);
        context.bindings.codexRecordOut = updated_record;

        context.log(updated_record);
        context.done();
        return;

    } else {
        context.done("Group does not exist");
        return;
    }
};

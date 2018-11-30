module.exports = function (context, req) {
    var timestamp = (new Date()).toJSON();
    var job_request = req.body;

    var async = require('async');
    var azure = require('azure-storage');

    var tableService = azure.createTableService();
    var queueService = azure.createQueueService();

    // TODO: Better handling of malformed requests

    if (!job_request.function) {
        context.done('A function is required.');
        return;
    }
    if (!job_request.payload) {
        context.done('A payload is required.');
        return;
    }

    // Create Job object ...
    var job = {
        id: context.executionContext.invocationId,
        function: job_request.function,
        payload: JSON.stringify(job_request.payload),
        status: "created",
        total_attempts: 0,
        max_attempts: 0,
        first_attempt_at: null,
        last_attempt_at: null,
        next_attempt_at: null,
        created_at: timestamp,
        updated_at: timestamp
    };

    // ... add table keys ...
    job.PartitionKey = job.function;
    job.RowKey = job.id;

    // ... add callback property, if provided ...
    if (job_request.callback) {
        job.callback = job_request.callback;
    } else {
        job.callback = null;
    }

    // ...and log that sucker.
    context.log(job);


    // Use a waterfall to avoid async I/O issues
    // TODO: change from waterfall to parallel
    async.waterfall([

        // Kickoff waterfall
        function(callback) {
            callback(null, job);
        },

        // Write job to table storage to track progress
        function(job, callback) {
            tableService.insertEntity('activeJobs', job, function(error, result, response) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, job);
                }
            });
        },

        // Add queue message to trigger job dispatcher
        function(job, callback) {
            // Base64 encode message to keep queue happy
            var queue_message = Buffer.from(job.id).toString('base64');
            queueService.createMessage(job.function, queue_message, function(error) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, job);
                }
            });
        }
    ],  
        // Close waterfall, and function, by returning error or job object
        function (err, job) {
            if (err) {
                context.done(err);
            } else {
                context.done(null, job);
            }
        }
    );
};

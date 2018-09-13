const client = require('./esConn');

client.cluster.health({}, (err, resp, status) => {
    if (err) {
        console.log(err);
    }
    console.log('-- Client Health --', resp);
    console.log('-- Client Health --', status);
});

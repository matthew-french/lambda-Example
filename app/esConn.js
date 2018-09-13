const elasticsearch = require('elasticsearch');

// https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html

const client = new elasticsearch.Client({
    host: 'http://localhost:9200',
});

module.exports = client;

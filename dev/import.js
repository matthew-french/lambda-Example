const AWS = require('aws-sdk');

const dateFormat = require('date-fns/format');
const uuid = require('uuid/v1');

const model = require('./rds/model.js');
const db = require('./rds/db.js');

// local
AWS.config.update({
    region: 'eu-west-1',
    endpoint: 'http://localhost:8000',
    accessKey: 'a',
    secretKey: 'a',
});

// AWS.config.update({
//     region: 'eu-west-1',
//     maxRetries: 5,
//     retryDelayOptions: {
//         base: 3000,
//     },
// });

const dynamodb = new AWS.DynamoDB();

const cats = [
    'Sayings and Quotes',
    'TV and Film',
    'Music',
    'Video Games',
    'Books',
    'Theatre',
    'Poetry',
];

const getItem = (current, next) => {
    const PutRequest = {
        PutRequest: {
            Item: AWS.DynamoDB.Converter.marshall({
                'quote': next.phrase,
                'language_category': `${next.language.toLowerCase()} ${cats[next.category].toLowerCase()}`.replace(/ /g, '_'),
                'language': next.language.toLowerCase(),
                'category_id': next.category,
                'category': cats[next.category],
                'game_id': next.games_id,
                'id': next.id,
                'uuid': uuid(),
                'last_modified': dateFormat(Date.now()),
            }),
        },
    };

    // console.log(PutRequest.PutRequest.Item.uuid);
    // console.log(PutRequest.PutRequest.Item.language_category);

    current.push(PutRequest);
    return current;
};

const chunkArray = (array, chunkSize) => Array.from(
    { length: Math.ceil(array.length / chunkSize) },
    (_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize),
);

const getParams = (i) => {
    const params = {
        RequestItems: {
            quotes: i,
        },
        ReturnConsumedCapacity: 'TOTAL',
        ReturnItemCollectionMetrics: 'SIZE',
    };
    return params;
};

let count = 0;
const backOff = 5000;
const processNumber = 5;

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const dynamoCall = async(batch, retries) => {

    const retriesPlusOne = retries + 1;
    const delayInMs = (backOff * retriesPlusOne);

    if (!batch.length) {
        return Promise.resolve('done');
    }

    return new Promise((resolve, reject) => dynamodb.batchWriteItem(getParams(batch), (err, data) => {

        if (err) {
            return reject(err);
        }

        if ((data.UnprocessedItems.quotes) && Array.isArray(data.UnprocessedItems.quotes)) {
            const params = data.UnprocessedItems.quotes;

            const delay = async() => {
                await timeout(delayInMs);
                await dynamoCall(params, retriesPlusOne);
            };

            console.log(`UnprocessedItems: ${count} - ${params.length} - ${delayInMs}: Retry: ${retriesPlusOne}`);

            delay();
        }

        count = count + processNumber;

        return resolve(data);

    })).catch((err) => {
        throw err;
    });
};

const handler = async() => {

    try {
        await db.connect();
        const rows = await model.getAllRows();
        const items = await rows.reduce(getItem, []);
        const chunks = await chunkArray(items, processNumber);

        for (const key in chunks) {
            console.log(`${key} : ${chunks.length}`);
            await dynamoCall(chunks[key], backOff, 0);
        }

        return 'done';

    }
    catch (err) {
        throw err;
    }
};

handler()
    .then(() => {
        console.log('Complete', count);
    },
    ).catch((error) => {
        console.log(error);
    });

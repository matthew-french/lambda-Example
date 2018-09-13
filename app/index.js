const client = require('./esConn');

const indexParams = (item) => {
    const index = {
        index: {
            '_index': 'quotes',
            '_type': 'quote',
            '_id': item.dynamodb.NewImage.uuid.S,
        },
    };
    const body = {
        'language': item.dynamodb.NewImage.language.S,
        'category': item.dynamodb.NewImage.category.S,
        'quote': item.dynamodb.NewImage.quote.S,
        'last_modified': item.dynamodb.NewImage.last_modified.S,
        'language_category': item.dynamodb.NewImage.language_category.S,
    };
    return [index, body];
};

const modifyParams = (item) => {
    const index = {
        update: {
            '_index': 'quotes',
            '_type': 'quote',
            '_id': item.dynamodb.NewImage.uuid.S,
        },
    };
    const body = {
        doc: {
            'language': item.dynamodb.NewImage.language.S,
            'category': item.dynamodb.NewImage.category.S,
            'quote': item.dynamodb.NewImage.quote.S,
            'last_modified': item.dynamodb.NewImage.last_modified.S,
            'language_category': item.dynamodb.NewImage.language_category.S,
        },
    };
    return [index, body];
};

const removeParams = (item) => {
    const index = {
        delete: {
            '_index': 'quotes',
            '_type': 'quote',
            '_id': item.dynamodb.Keys.uuid.S,
        },
    };
    return [index];
};

const bulkUpdate = (items) => client.bulk({ body: items });

const getItemByEventName = (item) => {
    let params = [];

    if (item.eventName === 'INSERT') {
        params = indexParams(item);
    }

    if (item.eventName === 'MODIFY') {
        params = modifyParams(item);
    }

    if (item.eventName === 'REMOVE') {
        params = removeParams(item);
    }

    return params;
};

const process = (records) => records.reduce((current, next) => {
    current.push(...getItemByEventName(next));
    return current;
}, []);

const consoleLogProcess = () => {
    console.log('execPath', process.execPath);
    console.log('execArgv', process.execArgv);
    console.log('argv', process.argv);
    console.log('cwd', process.cwd());
    console.log('filename', process.mainModule.filename);
    console.log('__filename', __filename);
    console.log('env', process.env);
    console.log('uid', process.getuid());
    console.log('gid', process.getgid());
    console.log('euid', process.geteuid());
    console.log('egid', process.getegid());
    console.log('getgroups', process.getgroups());
    console.log('umask', process.umask());

    console.log('event', event);

    console.log('context', context);

    console.log('RemainingTimeInMillis', context.getRemainingTimeInMillis());
};

const handler = async(event) => {
    context.callbackWaitsForEmptyEventLoop = false;
    consoleLogProcess();

    try {
        const params = process(event.Records);
        return await bulkUpdate(params);
    }
    catch (err) {
        throw err;
    }
};

module.exports = {
    handler,
};

const client = require('../app/esConn');

const search = (obj) => client.search(obj);

const closeConnection = () => client.close();

const params = {
    size: 1000,
    index: 'quotes',
    type: 'quote',
    body: {
        query: {
            bool: {
                must: {
                    match: {
                        category: 'TV and Film',
                    },
                },
                filter: [
                    {
                        term: { language: 'en' },
                    },
                ],
            },
        },
        sort: {

        },
    },
};

search(params)
    .then((res) => console.log('res', JSON.stringify(res, null, 4)))
    .then(closeConnection)
    .catch((err) => console.log(err));

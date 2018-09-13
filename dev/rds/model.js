const db = require('./db.js');

module.exports.getAllRows = () => new Promise((resolve, reject) => {
    db.get().query('SELECT * FROM games ORDER BY games_id ASC LIMIT 100;', (err, rows) => {
        if (err) {
            reject(err);
        }
        resolve(rows);
    });
});

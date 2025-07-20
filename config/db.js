const mysql = require('mysql2');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('./config');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodejs_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ Gagal koneksi ke MySQL:', err);
    } else {
        console.log('✅ Terhubung ke MySQL!');
    }
});

module.exports = db;
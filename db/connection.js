const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    password: '123',
    host: 'localhost',
    port: 5432,
    database: 'test_nutech',
    idleTimeoutMillis: 500
})

module.exports = pool;
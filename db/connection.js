const { Pool } = require('pg');
require('dotenv').config();

let pool;

try {
    // Check if we have a DATABASE_URL (provided by Railway)
    if (process.env.DATABASE_URL) {
        // Use the Railway DATABASE_URL
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Railway PostgreSQL
            },
            idleTimeoutMillis: 30000, // Timeout increased for cloud environment
            connectionTimeoutMillis: 2000,
        });
    } else {
        // Local development configuration
        pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '123',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'test_nutech',
            idleTimeoutMillis: 500
        });
    }

    // Test the database connection
    pool.on('connect', () => {
        console.log('Database connected successfully');
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });

} catch (error) {
    console.error('Error initializing database connection:', error);
    process.exit(-1);
}

module.exports = pool;

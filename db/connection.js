const { Pool } = require('pg');
require('dotenv').config();

let pool;

const initializePool = () => {
    try {
        // Check if we have a DATABASE_URL (provided by Railway)
        if (process.env.DATABASE_URL) {
            console.log('Connecting to Railway PostgreSQL...');
            pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false // Required for Railway PostgreSQL
                },
                // Connection pool settings
                max: 20, // Maximum number of clients in the pool
                idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
                connectionTimeoutMillis: 5000, // How long to wait before timing out when connecting a new client
                maxUses: 7500, // Close & replace a client after it has been used this many times
            });
        } else {
            console.log('Connecting to local PostgreSQL...');
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
            // Don't exit the process, try to recover
            initializePool();
        });

        // Test query to verify connection
        pool.query('SELECT NOW()', (err, res) => {
            if (err) {
                console.error('Error testing database connection:', err);
                throw err;
            }
            console.log('Database connection test successful');
        });

    } catch (error) {
        console.error('Error initializing database connection:', error);
        // Wait 5 seconds before retrying
        setTimeout(initializePool, 5000);
    }
};

// Initialize the pool
initializePool();

// Add a function to check pool health
const checkPool = async () => {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    } catch (err) {
        console.error('Error checking pool health:', err);
        return false;
    }
};

// Export pool and health check
module.exports = {
    pool,
    checkPool
};

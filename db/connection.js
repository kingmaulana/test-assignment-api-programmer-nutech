const { Pool } = require('pg');
require('dotenv').config();

// Log environment for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Database URL exists:', !!process.env.DATABASE_URL);

let pool;

const createPool = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const connectionConfig = process.env.DATABASE_URL ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Required for Railway PostgreSQL
        }
    } : {
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '123',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'test_nutech'
    };

    return new Pool({
        ...connectionConfig,
        max: isProduction ? 20 : 10,
        idleTimeoutMillis: isProduction ? 30000 : 5000,
        connectionTimeoutMillis: isProduction ? 5000 : 2000,
        maxUses: isProduction ? 7500 : 1000,
        application_name: 'nutech_api' // For identifying connection in PostgreSQL logs
    });
};

const initializePool = async () => {
    try {
        if (pool) {
            console.log('Closing existing pool connections...');
            await pool.end();
        }

        console.log('Initializing database pool...');
        pool = createPool();

        // Test the connection
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT version()');
            console.log('Database connected successfully:', result.rows[0].version);
        } finally {
            client.release();
        }

        // Set up event handlers
        pool.on('connect', () => {
            console.log('New client connected to database');
        });

        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            if (!pool._ended) {
                console.log('Attempting to recover pool...');
                setTimeout(initializePool, 5000);
            }
        });

        pool.on('remove', () => {
            console.log('Client removed from pool');
        });

    } catch (error) {
        console.error('Failed to initialize database pool:', error);
        console.log('Retrying in 5 seconds...');
        setTimeout(initializePool, 5000);
    }
};

// Initialize the pool
initializePool().catch(error => {
    console.error('Initial pool creation failed:', error);
    process.exit(1);
});

// Check pool health and attempt recovery if needed
const ensureConnection = async () => {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    } catch (err) {
        console.error('Connection check failed:', err);
        await initializePool();
        return false;
    }
};

// Export the pool with a getter to ensure we always have the latest instance
module.exports = {
    get pool() {
        return pool;
    },
    ensureConnection
};

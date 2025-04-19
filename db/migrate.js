require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

async function runMigrations() {
    console.log('Starting database migration process...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL exists:', !!process.env.DATABASE_URL);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL ? {
            rejectUnauthorized: false
        } : false,
        // Increased timeouts for migration
        connectionTimeoutMillis: 10000,
        statement_timeout: 60000
    });

    let client;
    try {
        // Read migration file
        console.log('Reading migration file...');
        const migrationPath = path.join(__dirname, 'migrations.sql');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');

        // Connect to database
        console.log('Connecting to database...');
        client = await pool.connect();

        // Start transaction
        console.log('Starting transaction...');
        await client.query('BEGIN');

        try {
            // Split migration file into individual statements
            const statements = migrationSQL
                .split(';')
                .map(statement => statement.trim())
                .filter(statement => statement.length > 0);

            // Execute each statement
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                console.log(`Executing migration statement ${i + 1} of ${statements.length}`);
                await client.query(statement);
            }

            // Commit transaction
            console.log('Committing transaction...');
            await client.query('COMMIT');
            console.log('Migration completed successfully!');
        } catch (error) {
            // Rollback on error
            console.error('Error during migration:', error);
            console.log('Rolling back transaction...');
            await client.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        if (client) {
            console.log('Releasing database connection...');
            client.release();
        }
        await pool.end();
    }
}

// Run migrations
console.log('Initiating migration process...');
runMigrations().then(() => {
    console.log('Migration process completed successfully.');
    process.exit(0);
}).catch(error => {
    console.error('Migration process failed:', error);
    process.exit(1);
});

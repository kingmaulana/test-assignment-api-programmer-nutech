const pool = require('./connection')

const query = `
            DROP TABLE IF EXISTS "Users";

            CREATE TABLE "Users"(
                id SERIAL PRIMARY KEY,
                first_name VARCHAR NOT NULL,
                last_name VARCHAR NOT NULL,
                email VARCHAR NOT NULL UNIQUE,
                password VARCHAR NOT NULL,
                balance NUMERIC DEFAULT 0,
                profile_image VARCHAR
            );
            
            DROP TABLE IF EXISTS "Banners";
            CREATE TABLE "Banners"(
                id SERIAL PRIMARY KEY,
                banner_name VARCHAR NOT NULL,
                banner_image VARCHAR NOT NULL,
                description TEXT
            );

            DROP TABLE IF EXISTS "Services";
            CREATE TABLE "Services" (
                id SERIAL PRIMARY KEY,
                service_code VARCHAR NOT NULL UNIQUE,
                service_name VARCHAR NOT NULL UNIQUE,
                service_icon VARCHAR NOT NULL,
                service_tariff NUMERIC NOT NULL
            );

            DROP TABLE IF EXISTS "Transactions";
            CREATE TABLE "Transactions" (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES "Users" (id) ON DELETE CASCADE,
                invoice_number VARCHAR NOT NULL UNIQUE,
                service_code VARCHAR REFERENCES "Services" (service_code) ON DELETE CASCADE,
                service_name VARCHAR REFERENCES "Services" (service_name) ON DELETE CASCADE,
                transaction_type VARCHAR NOT NULL,
                total_amount NUMERIC NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `;

(async() => {
    try {
        await pool.query(query);
        console.log('Database migration completed successfully.');
    } catch (error) {
        console.log(error);
    }
})();
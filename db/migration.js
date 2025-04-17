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
            `;

(async() => {
    try {
        await pool.query(query);
        console.log('Database migration completed successfully.');
    } catch (error) {
        console.log(error);
    }
})();
const pool = require('./connection')

const query = `
            DROP TABLE IF EXISTS "Users";

            CREATE TABLE "Users"(
                id SERIAL PRIMARY KEY,
                first_name VARCHAR NOT NULL,
                last_name VARCHAR NOT NULL,
                email VARCHAR NOT NULL UNIQUE,
                password VARCHAR NOT NULL
            );`;

(async() => {
    try {
        await pool.query(query);
        console.log('Database migration completed successfully.');
    } catch (error) {
        console.log(error);
    }
})();
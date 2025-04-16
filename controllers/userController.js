const pool = require('../db/connection');

class UserController {
    static async registration(req, res) {
        try {
            console.log("🚀 ~ UserController ~ registration ~ req:", req.body)
            const { first_name, last_name, email, password} = req.body;
            
            const query = `INSERT INTO "Users" (first_name, last_name, email, password
            ) VALUES ('${first_name}', '${last_name}', '${email}', '${password}')`;

            await pool.query(query);
        } catch (error) {
            console.log("🚀 ~ UserController ~ registration ~ error:", error)
        }
    }
}

module.exports = UserController;
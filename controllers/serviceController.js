const pool = require('../db/connection');

class ServiceController {

    static async getServices(req, res) {
        try {
            const query = `SELECT * FROM "Services"`;
            const result = await pool.query(query);

            return res.status(200).json({
                status: 0,
                message: "Sukses",
                data: result.rows
            })
        } catch (error) {
            console.log("🚀 ~ ServiceController ~ getServices ~ error:", error)
        }
    }
}
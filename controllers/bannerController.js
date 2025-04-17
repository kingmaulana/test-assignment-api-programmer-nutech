const pool = require('../db/connection');

class BannerController {
    static async getBanners(req, res) {
        try {
            const query = `SELECT * FROM "Banners"`;
            const result = await pool.query(query);

            return res.status(200).json({
                status: 0,
                message: "Sukses",
                data: result.rows
            })
        } catch (error) {
            console.log("🚀 ~ BannerController ~ getBanners ~ error:", error)
        }
    }

    static async getServices(req, res, next) {
        try {
            const query = `SELECT * FROM "Services"`;
            const result = await pool.query(query);

            return res.status(200).json({
                status: 0,
                message: "Sukses",
                data: result.rows
            })
        } catch (error) {
            console.log("🚀 ~ BannerController ~ getServices ~ error:", error)
        }
    }
}

module.exports = BannerController
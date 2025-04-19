const { verifyToken } = require("../helpers/jwt")
const { pool } = require('../db/connection');

async function authentication(req, res, next) {
    try {
        const bearerToken = req.headers.authorization
        if(!bearerToken) {
            return res.status(401).json({
                status: 108,
                message: "Token tidak tidak valid atau kadaluwarsa",
                data: null
            })
        }

        const token = bearerToken.split(" ")[1]
        // console.log("🚀 ~ authentication ~ token:", token)
        const decoded = verifyToken(token, process.env.JWT_SECRET)
        // console.log("🚀 ~ authentication ~ decoded:", decoded)
        const query = `SELECT * FROM "Users" WHERE email = '${decoded}'`;
        const result = await pool.query(query);
        // console.log("🚀 ~ authentication ~ result:", result)

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 108,
                message: "Token tidak tidak valid atau kadaluwarsa",
                data: null
            });
        }
        
        // console.log("🚀 ~ authentication ~ req.user:", req.user)
        req.user = result.rows[0]
        next()
    } catch (error) {
        console.log("🚀 ~ authentication ~ error:", error)
    }
}

module.exports = authentication
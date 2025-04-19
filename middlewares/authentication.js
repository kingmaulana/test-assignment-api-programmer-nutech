const { verifyToken } = require("../helpers/jwt");
const { pool } = require('../db/connection');

async function authentication(req, res, next) {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return res.status(401).json({
                status: 108,
                message: "Token tidak valid, silakan login kembali",
                data: null
            });
        }

        if (!bearerToken.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 108,
                message: "Format token tidak valid",
                data: null
            });
        }

        const token = bearerToken.split(" ")[1];
        let userEmail;
        
        try {
            userEmail = verifyToken(token);
        } catch (tokenError) {
            return res.status(401).json({
                status: 108,
                message: "Token tidak valid atau kadaluwarsa",
                data: null
            });
        }

        // Use parameterized query to prevent SQL injection
        const query = 'SELECT * FROM "Users" WHERE email = $1';
        const result = await pool.query(query, [userEmail]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                status: 108,
                message: "User tidak ditemukan",
                data: null
            });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({
            status: 500,
            message: "Terjadi kesalahan pada server",
            data: null
        });
    }
}

module.exports = authentication;

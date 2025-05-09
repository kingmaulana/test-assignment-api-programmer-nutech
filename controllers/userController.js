const { pool } = require('../db/connection');
const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

class UserController {
    static async registration(req, res) {
        try {
            console.log("🚀 ~ UserController ~ registration ~ req:", req.body)
            const { first_name, last_name, email, password} = req.body;

            if(password.length < 8) {
                return res.status(400).json({ 
                    status: 102,
                    message: "Password minimal 8 karakter",
                    data: null
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    status: 102,
                    message: "Paramter email tidak sesuai format",
                    data: null
                });
            }

            const encryptedPassword = hashPassword(password); 

            const query = `INSERT INTO "Users" (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)`;
            const values = [first_name, last_name, email, encryptedPassword];

            await pool.query(query, values);

            return res.status(200).json({
                status: 0,
                message: "Registrasi berhasil silahkan login",
                data: null
            })
        } catch (error) {
            console.log("🚀 ~ UserController ~ registration ~ error:", error)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if(password.length < 8) {
                return res.status(400).json({ 
                    status: 102,
                    message: "Password minimal 8 karakter",
                    data: null
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    status: 102,
                    message: "Paramter email tidak sesuai format",
                    data: null
                });
            }

            const query = `SELECT * FROM "Users" WHERE email = $1`;
            const values = [email];
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(401).json({
                    status: 103,
                    message: "Username atau password salah",
                    data: null
                });
            }
            
            const user = result.rows[0];
            console.log("🚀 ~ UserController ~ login ~ user:", user.email)
            const isPasswordValid = comparePassword(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    status: 103,
                    message: "Username atau password salah",
                    data: null
                });
            }

            const access_token = signToken(user.email)

            return res.status(200).json({
                status: 0,
                message: "Login Sukses",
                data: {
                    token: access_token
                }
            });

        } catch (error) {
            console.log("🚀 ~ UserController ~ login ~ error:", error)
        }
    }

    static async getProfile(req, res, next) {
        try {
            return res.status(200).json({
                status: 0,
                message: "Sukses",
                data: {
                    email: req.user.email,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name,
                    profile_image: req.user.profile_image
                }
            });
            
        } catch (error) {
            console.log("🚀 ~ UserController ~ getProfile ~ error:", error)
        }
    }

    static async updateProfile(req, res, next) {
        try {
            const {first_name, last_name} = req.body;

            const query = `UPDATE "Users" SET first_name = $1, last_name = $2 WHERE email = $3`;
            const values = [first_name, last_name, req.user.email];
            const result = await pool.query(query, values);

            if(result.rowCount === 0) {
                return res.status(404).json({
                    status: 104,
                    message: "User tidak ditemukan",
                    data: null
                });
            }

            return res.status(200).json({
                status: 0,
                message: "Update Profile berhasil",
                data: {
                    email: req.user.email,
                    first_name: first_name,
                    last_name: last_name,
                    profile_image: req.user.profile_image
                }
            });
            

        } catch (error) {
            console.log("🚀 ~ UserController ~ updateProfile ~ error:", error)
        }
    }

    static async updateImage(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 102,
                    message: "Gambar tidak ditemukan",
                    data: null
                });
            }

            // Get file details
            const { buffer, mimetype, originalname } = req.file;

            // Check file size (max 5MB)
            if (buffer.length > 5 * 1024 * 1024) {
                return res.status(400).json({
                    status: 102,
                    message: "Ukuran gambar terlalu besar (maksimal 5MB)",
                    data: null
                });
            }

            // Convert to base64
            const base64Image = buffer.toString('base64');
            const imageUrl = `data:${mimetype};base64,${base64Image}`;

            try {
                const query = `UPDATE "Users" SET profile_image = $1 WHERE email = $2 RETURNING *`;
                const values = [imageUrl, req.user.email];
                const result = await pool.query(query, values);

                if (result.rowCount === 0) {
                    return res.status(404).json({
                        status: 104,
                        message: "User tidak ditemukan",
                        data: null
                    });
                }

                const updatedUser = result.rows[0];
                return res.status(200).json({
                    status: 0,
                    message: "Update Profile Image berhasil",
                    data: {
                        email: updatedUser.email,
                        first_name: updatedUser.first_name,
                        last_name: updatedUser.last_name,
                        profile_image: imageUrl
                    }
                });
            } catch (dbError) {
                console.error("Database error:", dbError);
                return res.status(500).json({
                    status: 500,
                    message: "Gagal menyimpan gambar",
                    data: null
                });
            }
        } catch (error) {
            console.error("🚀 ~ UserController ~ updateImage ~ error:", error);
            return res.status(500).json({
                status: 500,
                message: "Internal server error",
                data: null
            });
        }
    }
}

module.exports = UserController;

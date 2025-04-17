const pool = require('../db/connection');
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

            const query = `INSERT INTO "Users" (first_name, last_name, email, password
            ) VALUES ('${first_name}', '${last_name}', '${email}', '${encryptedPassword}')`;

            await pool.query(query);

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

            const query = `SELECT * FROM "Users" WHERE email = '${email}'`;
            const result = await pool.query(query);

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

            const access_token = signToken( user.email )

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

            const query = `UPDATE "Users" SET first_name = '${first_name}', last_name = '${last_name}' WHERE email = '${req.user.email}'`;
            const result = await pool.query(query);

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
            console.log("🚀 ~ UserController ~ updateImage ~ req:", req)
            if(!req.file) {
                return res.status(400).json({
                    status: 102,
                    message: "Gambar tidak ditemukan",
                    data: null
                });
            }

            const imageUrl = req.file.path;

            const query = `UPDATE "Users" SET profile_image = '${imageUrl}' WHERE email = '${req.user.email}'`;
            const result = await pool.query(query);

            return res.status(200).json({
                status: 0,
                message: "Update Profile Image berhasil",
                data: {
                    email: req.user.email,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name,
                    profile_image: imageUrl
                }
            })
        } catch (error) {
            console.log("🚀 ~ UserController ~ updateImage ~ error:", error)
        }
    }
}

module.exports = UserController;
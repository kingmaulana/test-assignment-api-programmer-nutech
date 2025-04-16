const pool = require('../db/connection');
const { hashPassword } = require('../helpers/bcrypt');

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

        } catch (error) {
            console.log("🚀 ~ UserController ~ login ~ error:", error)
        }
    }
}

module.exports = UserController;
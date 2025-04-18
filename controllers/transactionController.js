const pool = require('../db/connection');

class TransactionController {

    static async getBalance(req, res) {
        try {
            return res.status(200).json({
                status: 0,
                message: "Get Balance Berhasil",
                data: {
                    balance: req.user.balance
                }
            });
        } catch (error) {
            console.log("🚀 ~ TransactionController ~ getBalance ~ error:", error)
        }
    }
}

module.exports = TransactionController;
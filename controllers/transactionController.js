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

    static async topUp(req, res) {
        try {
            // console.log(res.user)
            const { top_up_amount } = req.body;

            if (!top_up_amount || top_up_amount <= 0 || isNaN(top_up_amount)) {
                return res.status(400).json({
                    status: 104,
                    message: "Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
                    data: null
                });
            }

            const invoice_number = `INV-${Date.now()}`;
            const transaction_type = "TOPUP";
            
            const addBalanceQuery = `UPDATE "Users" SET balance = balance + ${top_up_amount} WHERE id = ${req.user.id} RETURNING *`;
            const addBalanceResult = await pool.query(addBalanceQuery);
            const latestBalance = addBalanceResult.rows[0].balance;
            
            //make transaction log
            const logTopUpQuery = `INSERT INTO "Transactions" (user_id, invoice_number, transaction_type, total_amount) VALUES (${req.user.id}, '${invoice_number}', '${transaction_type}', ${top_up_amount}) RETURNING *`;

            const logTopUpResult = await pool.query(logTopUpQuery);

            return res.status(200).json({
                status: 0,
                message: "Top Up Balance berhasil",
                data: {
                    balance: latestBalance,
                }
            })


        } catch (error) {
            console.log("🚀 ~ TransactionController ~ topUp ~ error:", error)
        }
    }

    static async createTransaction(req, res) {
        try {
            
        } catch (error) {
            console.log("🚀 ~ TransactionController ~ createTransaction ~ error:", error)
        }
    }
}

module.exports = TransactionController;
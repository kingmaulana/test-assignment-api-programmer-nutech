const pool = require('../db/connection');

class TransactionController {

    static async getBalance(req, res, next) {
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

    static async topUp(req, res, next) {
        try {
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
            
            const addBalanceQuery = `UPDATE "Users" SET balance = balance + $1 WHERE id = $2 RETURNING *`;
            const addBalanceValues = [top_up_amount, req.user.id];
            const addBalanceResult = await pool.query(addBalanceQuery, addBalanceValues);
            const latestBalance = addBalanceResult.rows[0].balance;
            
            const logTopUpQuery = `INSERT INTO "Transactions" (user_id, invoice_number, transaction_type, total_amount) VALUES ($1, $2, $3, $4) RETURNING *`;
            const logTopUpValues = [req.user.id, invoice_number, transaction_type, top_up_amount];
            const logTopUpResult = await pool.query(logTopUpQuery, logTopUpValues);

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

    static async createTransaction(req, res, next) {
        try {
            const { service_code } = req.body;

            const serviceQuery = `SELECT * FROM "Services" WHERE service_code = $1`;
            const serviceResult = await pool.query(serviceQuery, [service_code]);
            const service = serviceResult.rows[0];
            const tarifResult = service.service_tariff;

            const userQuery = `SELECT * FROM "Users" WHERE email = $1`;
            const userResult = await pool.query(userQuery, [req.user.email]);
            const userBalance = userResult.rows[0].balance;

            if(userBalance >= tarifResult) {
                const updateBalanceQuery = `UPDATE "Users" SET balance = balance - $1 WHERE id = $2 RETURNING *`;
                const resultBalance = await pool.query(updateBalanceQuery, [tarifResult, req.user.id]);

                const invoiceNumber = `INV-${Date.now()}`;
                const serviceCode = service.service_code;
                const serviceName = service.service_name;
                const totalAmount = service.service_tariff;

                const writeTransactionQuery = `INSERT INTO "Transactions" (user_id, invoice_number, service_code, service_name, transaction_type, total_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
                const writeTransactionValues = [req.user.id, invoiceNumber, serviceCode, serviceName, 'PAYMENT', totalAmount];
                const resultTransaction = await pool.query(writeTransactionQuery, writeTransactionValues);

                return res.status(200).json({
                    status: 0,
                    message: "Transaksi berhasil",
                    data: {
                        invoice_number: invoiceNumber,
                        service_code: serviceCode,
                        service_name: serviceName,
                        transaction_type: "PAYMENT",
                        total_amount: totalAmount,
                        created_on: `${Date.now()}`
                    }
                })
            }

        } catch (error) {
            console.log("🚀 ~ TransactionController ~ createTransaction ~ error:", error)
        }
    }

    static async transactionHistory(req, res, next) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit);
            const offset = parseInt(req.query.offset) || 0;

            let getTransactionQuery = `SELECT invoice_number, transaction_type, total_amount, created_at
                                       FROM "Transactions" 
                                       WHERE user_id = $1 
                                       ORDER BY created_at DESC`;

            const values = [userId];

            if (!isNaN(limit)) {
                getTransactionQuery += ` LIMIT $2 OFFSET $3`;
                values.push(limit, offset);
            }

            const transactionResult = await pool.query(getTransactionQuery, values);
            console.log("🚀 ~ TransactionController ~ transactionHistory ~ transactionResult:", transactionResult.rows)

            res.status(200).json({
                status: 0,
                message: "Get History Berhasil",
                data: {
                    offset: offset,
                    limit: isNaN(limit) ? null : limit,
                    records: transactionResult.rows
                }
            });
        } catch (error) {
            console.log("🚀 ~ TransactionController ~ transactionHistory ~ error:", error);
            res.status(500).json({
                status: 1,
                message: "Terjadi kesalahan saat mengambil riwayat transaksi"
            });
        }
    }

}

module.exports = TransactionController;

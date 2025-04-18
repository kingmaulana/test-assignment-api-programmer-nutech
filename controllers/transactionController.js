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
            const { service_code } = req.body;

            const serviceQuery = `SELECT * FROM "Services" WHERE service_code = '${service_code}'`;
            const serviceResult = await pool.query(serviceQuery);
            const tarifResult = serviceResult.rows[0].service_tariff;
            // console.log("🚀 ~ TransactionController ~ createTransaction ~ tarifResult:", tarifResult)

            //cek balance pada user
            const userQuery = `SELECT * FROM "Users" WHERE email = '${req.user.email}'`;
            const userResult = await pool.query(userQuery)
            // console.log("🚀 ~ TransactionController ~ createTransaction ~ user:", userResult)
            const userBalance = userResult.rows[0].balance;
            // console.log("🚀 ~ TransactionController ~ createTransaction ~ amountUser:", userBalance)
            if(userBalance => tarifResult) {

                const updateBalanceQuery = `UPDATE "Users" SET balance = balance - ${tarifResult} WHERE id = ${req.user.id} RETURNING *`
                const resultBalance = await pool.query(updateBalanceQuery);

                const invoiceNumber = `INV-${Date.now()}`;
                const serviceCode = serviceResult.rows[0].service_code;
                const serviceName = serviceResult.rows[0].service_name;
                const totalAmount = serviceResult.rows[0].service_tariff;

                const writeTransactionQuery = `INSERT INTO "Transactions" (user_id, invoice_number, service_code, service_name, transaction_type, total_amount) VALUES (${req.user.id}, '${invoiceNumber}', '${serviceCode}', '${serviceName}' ,'PAYMENT', ${totalAmount}) RETURNING *`

                const resultTransaction = await pool.query(writeTransactionQuery)

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
}

module.exports = TransactionController;
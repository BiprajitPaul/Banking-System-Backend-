const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const mongoose = require('mongoose');
const emailService = require('../services/email.service');

/**
 * -Create a new transaction
 * The 10 steps to create a transaction are as follows:
 * 1. Validate request
 * 2. validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction with status pending
 * 6. Create debit ledger entry for sender
 * 7. Create credit ledger entry for receiver
 * 8. Mark transaction as complete
 * 9. Commit MongoDB session
 * 10. Send email notification
 */
async function createTransaction(req, res) {


    /**
     * 1. Validate request
     */

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
    // Validate required fields
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        res.status(400).json({
            message: "fromAccount , toAccount , amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,

    })

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })
    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({
            message: "From account or to account not found"
        })
    }

    /**
     * 2. validate idempotency key
     */
    const isTransactionExist = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })
    if (isTransactionExist) {
        if (isTransactionExist.status === "COMPLETE") {
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: isTransactionExist
            })
        }
        if (isTransactionExist.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is still in process",

            })
        }
        if (isTransactionExist.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction failed in previous attempt",
            })
        }
        if (isTransactionExist.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed in previous attempt",
            })
        }
    }

    /**
     * 3. Check account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both from and to accounts must be active to process the transaction"
        })
    }

    /**
     * 4. Derive sender balance from ledger
     * We will calculate the sender balance by aggregating the ledger entries for the sender account.
     * We will sum up all the credit entries and debit entries for the sender account and derive the balance.
     */
    const balance = await fromUserAccount.getBalance();
    if (balance < amount) { // If the sender balance is less than the transaction amount, return an error response
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Required balance is ${amount}`
        })
    }
    let transaction;
    try {
        /**
         * 5. Create transaction with status pending
         */
        const session = await mongoose.startSession();
        session.startTransaction();
        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"

        }], { session }))[0]

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            transaction: transaction._id,
            amount: amount,
            type: "DEBIT"
        }], { session })

        await new Promise(resolve => setTimeout(resolve, 10000));

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            transaction: transaction._id,
            amount: amount,
            type: "CREDIT"


        }], { session })
        // Mark transaction as complete
        await transactionModel.findByIdAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETE" },
            { session }
        )

        // Commit MongoDB session
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        return res.status(500).json({
            message: "Transaction is pending due to an error. Please try again later",
            error: error.message
        })
    }





    /**
     * 10. Send email notification
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);
    res.status(201).json({
        message: "Transaction successful",
        transaction: transaction
    })




}

async function createInitialFundsTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount , amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })
    if (!toUserAccount) {
        return res.status(404).json({
            message: "To account not found"
        })
    }

    const fromUserAccount = await accountModel.findOne({

        user: req.user._id

    })
    if (!fromUserAccount) {
        return res.status(404).json({
            message: "System account not found for the user"
        })
    }

    /**
     * The rest of the steps are same as createTransaction function except we don't need to check balance for system account and we will use fromUserAccount as system account
     */

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        transaction: transaction._id,
        amount,
        type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        transaction: transaction._id,
        amount,
        type: "CREDIT"
    }], { session })

    // Mark transaction as complete
    transaction.status = "COMPLETE";
    await transaction.save({ session })
    // Commit MongoDB session
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: "Initial funds transaction successful",
        transaction
    })
}

/**
 * - Get paginated transaction history for the authenticated user
 * - GET /api/transactions/history?page=1&limit=10
 */
async function getTransactionHistory(req, res) {
    try {
        // Get all accounts belonging to the authenticated user
        const userAccounts = await accountModel.find({ user: req.user._id }).select("_id");
        const accountIds = userAccounts.map((acc) => acc._id);

        // Parse pagination params
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        // Build filter — transactions where user is sender OR receiver
        const filter = {
            $or: [
                { fromAccount: { $in: accountIds } },
                { toAccount: { $in: accountIds } },
            ],
        };

        // Run count + paginated query in parallel
        const [totalTransactions, transactions] = await Promise.all([
            transactionModel.countDocuments(filter),
            transactionModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("fromAccount", "_id currency status")
                .populate("toAccount", "_id currency status"),
        ]);

        const totalPages = Math.ceil(totalTransactions / limit);

        return res.status(200).json({
            status: "success",
            page,
            limit,
            totalTransactions,
            totalPages,
            data: transactions,
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch transaction history",
            error: error.message,
        });
    }
}

module.exports = { createTransaction, createInitialFundsTransaction, getTransactionHistory }
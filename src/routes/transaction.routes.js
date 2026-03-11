const express = require('express');
const transactionRouter = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require("../middlewares/auth.middleware")
const { transactionLimiter } = require('../middlewares/rateLimit.middleware');

/**
 *  - POST /api/transactions/
 *  - Create a new transaction
 */
transactionRouter.post("/" , authMiddleware.authMiddleware , transactionLimiter , transactionController.createTransaction)

/**
 *  - POST/api/transactions/system/initial-funds
 * - Create initial funds transaction from system account to user account
 * - This route will be used to create initial funds transaction from system account to user account when a new user registers.
 * - This route will be called from auth.controller after successful registration of a new user.
 * - This route will be protected and can only be accessed by the system user.
 */

transactionRouter.post("/system/initial-funds" , authMiddleware.authSystemUserMiddleware , transactionController.createInitialFundsTransaction)

/**
 *  - GET /api/transactions/history?page=1&limit=10
 *  - Get paginated transaction history for the authenticated user
 *  - Protected Route
 */
transactionRouter.get("/history" , authMiddleware.authMiddleware , transactionController.getTransactionHistory)

module.exports = transactionRouter;
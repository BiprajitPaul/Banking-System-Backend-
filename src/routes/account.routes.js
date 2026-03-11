const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router();
const accountController = require("../controllers/account.controller")


/**
 * -POST /api/accounts/
 * - Create a new account
 * - Protected Route
 */

router.post("/", authMiddleware.authMiddleware, accountController.accountCreate)


/**
 * - GET /api/accounts/
 * - Get all accounts for the authenticated user
 * - Protected Route
 */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccounts)
/**
 * GET/api/accounts/balance/:accountId
 * Get the balance of all accounts for the authenticated user
 * Protected Route
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalance)

module.exports = router;
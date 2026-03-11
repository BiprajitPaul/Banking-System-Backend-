const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

//  POST /api/auth/register

router.post('/register', authLimiter, authController.register);

router.post("/login", authLimiter, authController.login);


/**
 * - POST /api/auth/logout
 */

router.post("/logout", authController.logout)




module.exports = router;
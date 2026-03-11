const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

/**
 * Auth rate limiter — 5 requests per minute per IP.
 * Applied to login and register endpoints.
 */
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => ipKeyGenerator(req.ip), // ipKeyGenerator expects an IP string, not the req object
    handler: (_req, res) => {
        res.status(429).json({
            status: "failed",
            message:
                "Too many requests from this IP address. Please try again after 1 minute.",
        });
    },
});

/**
 * Transaction rate limiter — 10 requests per minute per authenticated user.
 * Falls back to IP-based limiting if no user is attached to the request.
 */
const transactionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) =>
        req.user?._id?.toString() || ipKeyGenerator(req.ip), // per-user when authenticated, IPv6-safe IP otherwise
    handler: (_req, res) => {
        res.status(429).json({
            status: "failed",
            message:
                "Too many transaction requests. Please try again after 1 minute.",
        });
    },
});

module.exports = { authLimiter, transactionLimiter };

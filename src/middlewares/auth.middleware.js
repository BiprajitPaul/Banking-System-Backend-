const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken");

const tokenBlacklistModel = require("../models/blacklist.model")
async function authMiddleware(req,res,next){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // token can be in cookie or in header
    if(!token){
        return res.status(401).json({
            message : "Unauthorized access"
        })
    }
    const isBlacklisted = await tokenBlacklistModel.findOne({token: token})
    if(isBlacklisted){
        return res.status(401).json({
            message : "Unauthorized access. Token is blacklisted."
        })
    }
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        console.log(decoded)
        const user = await userModel.findById(decoded.userId)
        req.user = user
        return next()
    }
    catch(err){
        console.log(err)
        return res.status(401).json({
            message : "Unauthorized access"
        })
    }
}

async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // token can be in cookie or in header
    if(!token){
        return res.status(401).json({
            message : "Unauthorized access"
        })
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({token: token})
    if(isBlacklisted){
        return res.status(401).json({
            message : "Unauthorized access. Token is blacklisted."
        })
    }
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        console.log(decoded)
        const user = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message : "Forbidden access. System user only."
            })
        }
        req.user = user
        return next()

    }
    catch(err){
        console.log(err)
        return res.status(401).json({
            message : "Unauthorized access"
        })
    }
}
module.exports = {authMiddleware, authSystemUserMiddleware};
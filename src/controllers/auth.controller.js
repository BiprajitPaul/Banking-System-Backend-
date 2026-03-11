const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require("../services/email.service")
const tokenBlacklistModel = require('../models/blacklist.model');
/**
*- user register controller
*- POST /api/auth/register
*/
async function register(req, res) {
    const { email, name, password } = req.body;

    const isExist = await userModel.findOne({ email });

    if (isExist) {
        return res.status(422).json({
            message: "Email address already exists. Please use a different email address.",
            status: "failed"
        })
    }
    else {
        const user = await userModel.create({
            email, name, password
        })

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )
        res.cookie("token", token)
        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

        await emailService.sendRegisterEmail(user.email , user.name)
    }

}
/**
 * - user Login controller
 * - POST /api/auth
 */
async function login(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email }).select("+password")

    if (!user) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }

    const isValidUser = await user.comparePassword(password)
    if (!isValidUser) {
        return res.status(401).json({
            message: "Email or password is INVALID"
        })
    }
    const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )
        res.cookie("token", token)
        res.status(200).json({
            message : "Logged in",
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

}

async function logout(req,res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; // token can be in cookie or in header
    if(!token){
        return res.status(200).json({
            message : "User logged out successfully No token for Blacklisting"
        })
    }
    res.clearCookie("token")

    await tokenBlacklistModel.create({
        token: token
    })

    res.status(200).json({
        message : "User logged out successfully"
    })


}


module.exports = { register, login, logout }
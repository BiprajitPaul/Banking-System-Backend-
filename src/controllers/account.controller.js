const accountModel = require("../models/account.model")
const userModel = require("../models/user.model")

async function accountCreate(req,res){

    const user = req.user;
    const account = await accountModel.create({
        user : user._id
    })
    res.status(201).json({
        account
    })
}

async function getUserAccounts(req,res){
    // Check if the logged-in user is a system user
    const fullUser = await userModel.findById(req.user._id).select("+systemUser")
    
    let query = {};
    if (!fullUser.systemUser) {
        // Regular user: only return their own accounts
        query.user = req.user._id;
    }
    // System user: query is empty {}, so it returns ALL accounts

    const accounts = await accountModel.find(query)
    res.status(200).json({
        accounts
    })
}
async function getAccountBalance(req,res){
    const accountId = req.params.accountId;
    const account = await accountModel.findOne({
        _id : accountId,
        user : req.user._id
})
    if(!account){
        return res.status(404).json({
            message : "Account not found"
        })
    }
    const balance = await account.getBalance();
    res.status(200).json({
        accountId,
        balance
    })
}
module.exports = {accountCreate, getUserAccounts, getAccountBalance};
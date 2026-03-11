const accountModel = require("../models/account.model")

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
    const accounts = await accountModel.find({
        user : req.user._id
    })
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
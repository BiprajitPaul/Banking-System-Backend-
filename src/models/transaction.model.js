const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with a from account"],
        index: true

    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must be associated with a to account"],
        index: true
    },
    status :{
        type : String,
        enum:{
            values :["PENDING" , "COMPLETE" , "FAILED" , "REVERSED"],
            messgae : "Status can be either pending , complete , faield or Reversed"
        },
        defualt : "PENDING"
    },
    amount:{
        type : Number,
        required :[true ,  "Transaction amount is required"],
        min : [0 , "Transaction amount must be greater than or equal to 0"]

    },

    idempotencyKey : {
        type : String,
        required : [true , "Idempotency key is required for creating a transaction"],
        unique : true,
        index : true
    }
}, {
    timestamps: true
})

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;
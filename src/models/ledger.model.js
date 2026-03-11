const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "account",
        required : [true , "Ledger entry must be associated with an account"],
        index : true,
        immutable: true
    },
    amount :{
        type : Number,
        required : [true , "Ledger entry must have an amount"],
        min : [0 , "Ledger entry amount must be greater than or equal to 0"],
        immutable: true
    },
    transaction :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "transaction",
        required : [true , "Ledger entry must be associated with a transaction"],
        index : true,
        immutable: true
    },
    type :{
        type : String,
        enum:{
            values : ["DEBIT" , "CREDIT"],
            message : "Ledger entry type can be either DEBIT or CREDIT"
        },
        required : [true , "Ledger entry must have a type"],
        immutable: true
        }
})

function preventLedgerModification() {
    throw new Error("Ledger entries cannot be modified after creation.");
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('update', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('replaceOne', preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;
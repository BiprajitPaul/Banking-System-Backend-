const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

const accountSchema = new mongoose.Schema({
    user: { // Each account is associated with a user
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "Account must be associated with a user."],
        index: true
    },
    status: { // Account status can be active , frozen or closed
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either active , frozen or closed",
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, "Cuurency is required for creating an account"],
        default: "INR"

    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields to the account document
})

accountSchema.index({ user: 1, status: 1 }) // Compound index on user and status for efficient querying of accounts by user and status

accountSchema.methods.getBalance = async function () {
    /**
     * Calculate the account balance by aggregating the ledger entries associated with this account.
     * We will sum up all the CREDIT entries and subtract all the DEBIT entries to get the current balance.
     * We will use the ledgerModel to fetch the ledger entries for this account and calculate the balance.
     */
    const balanceData = await ledgerModel.aggregate([ // Aggregate pipeline to calculate the balance for this account
        { $match: { account: this._id } }, // Match ledger entries for this account
        {
            $group: { // Group the ledger entries by account and calculate totalDebit and totalCredit
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "DEBIT"] }, // If the ledger entry type is DEBIT, add the amount to totalDebit
                            "$amount", // If the ledger entry type is DEBIT, add the amount to totalDebit
                            0 // Otherwise, add 0 to totalDebit
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"] }, // If the ledger entry type is CREDIT, add the amount to totalCredit
                            "$amount", // If the ledger entry type is CREDIT, add the amount to totalCredit
                            0 // Otherwise, add 0 to totalCredit
                        ]
                    }
                }
            }

        
        },
        {
            $project: { // Project the final balance by subtracting totalDebit from totalCredit
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"] } // Calculate the balance by subtracting totalDebit from totalCredit
            }
        }
    ])

    if(balanceData.length === 0){
        return 0; // If there are no ledger entries for this account, return a balance of 0
    }
    return balanceData[0].balance; // Return the calculated balance for this account



}
const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;


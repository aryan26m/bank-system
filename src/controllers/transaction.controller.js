const transactionModel=require("../models/transaction.model");
const ledgerModel=require("../models/ledger.model");
const mongoose=require("mongoose");
const accountModel=require("../models/account.model");
const EmailService=require("../services/email.sevice");

async function createTransaction(req,res){

    //validate request
    const {fromAccount,toAccount,amount,idempotencyKey }=req.body;
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({message:"All fields are required"});
    }
    if (!mongoose.Types.ObjectId.isValid(fromAccount) || !mongoose.Types.ObjectId.isValid(toAccount)) {
        return res.status(400).json({ message: "Invalid fromAccount or toAccount" });
    }

    if (Number(amount) <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const fromUserAccount=await accountModel.findOne({
        _id:fromAccount,
        user: req.user._id
    });

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    });

    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({ message: "One or both accounts not found" });
    }

    const isTransactionExist=await transactionModel.findOne({
        idempotencyKey:idempotencyKey
    })

    if(isTransactionExist){
        if(isTransactionExist.status === "completed"){
            return res.status(200).json({message:"Transaction already completed",transaction:isTransactionExist});
        }
        else if(isTransactionExist.status === "pending"){
            return res.status(200).json({message:"Transaction is pending",transaction:isTransactionExist});
        }
        else if(isTransactionExist.status === "failed"){
            return res.status(500).json({message:"Transaction already failed",transaction:isTransactionExist});
        }
        else if(isTransactionExist.status === "reversed"){
            return res.status(200).json({message:"Transaction already reversed",transaction:isTransactionExist});
        }
    }

    if(fromUserAccount.status !== "active" || toUserAccount.status !== "active"){
        return res.status(400).json({message:"One or both accounts are not active"});
    }

    const senderBalance=await fromUserAccount.getBalance();

    if(senderBalance < Number(amount)){
        return res.status(400).json({message:`Insufficient balance. Current balance is ${senderBalance} required amount is ${amount}`});
    }

    let session
    try {
        session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new transactionModel({
            fromAccount,
            toAccount,
            amount: Number(amount),
            idempotencyKey,
            status: "pending"
        })

        await ledgerModel.create([{
            account: fromAccount,
            type: "debit",
            amount: Number(amount),
            transaction: transaction._id
        }], { session })

        await ledgerModel.create([{
            account: toAccount,
            type: "credit",
            amount: Number(amount),
            transaction: transaction._id
        }], { session })

       await transactionModel.findOneAndUpdate({
            _id: transaction._id},
             {status: "completed"},
         { session});

        await session.commitTransaction();
        EmailService.sendTransactionEmail(req.user.email,req.user.name,Number(amount),toAccount)
        return res.status(201).json({message:"Transaction completed successfully",transaction})
    } catch (error) {
        if (session) {
            await session.abortTransaction().catch(() => {})
        }
        return res.status(500).json({
            message: "Failed to complete transaction",
            error: error.message
        })
                // all now oprn which should be done is to commit the transaction, which will make all the changes permanent in the database. If any error occurs during the transaction, we can roll back the transaction to ensure data integrity.
       
    } finally {
        if (session) {
            session.endSession()
        }
    }

    }


async function createInitialFundsTransaction(req, res) {
    const {toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    let session
    try {
        session = await mongoose.startSession()
        session.startTransaction()

        const transaction = new transactionModel({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "pending"
        })

        await ledgerModel.create([ {
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "debit"
        } ], { session })

        await ledgerModel.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "credit"
        } ], { session })

        transaction.status = "completed"
        await transaction.save({ session })

        await session.commitTransaction()

        return res.status(201).json({
            message: "Initial funds transaction completed successfully",
            transaction: transaction
        })
    } catch (error) {
        if (session) {
            await session.abortTransaction().catch(() => {})
        }
        return res.status(500).json({
            message: "Failed to complete initial funds transaction",
            error: error.message
        })
    } finally {
        if (session) {
            session.endSession()
        }
    }


}

module.exports={createTransaction,createInitialFundsTransaction};



const accountModel=require("../models/account.model");
const mongoose=require("mongoose");


async function createAccount(req,res){
    const user=req.user;
    const account=await accountModel.create({user:user._id});
    res.status(201).json({message:"Account created successfully",account});
}


async function getAllAccounts(req,res) {
    const user=req.user;
    const accounts = await accountModel.find({
        user : user._id
    });
    res.status(200).json({accounts});
}

async function getAccountBalance(req,res) {
const {accountId}=req.params;

if(!mongoose.Types.ObjectId.isValid(accountId)){
    return res.status(400).json({message:"Invalid account id"});
}

const account=await accountModel.findOne({
    _id:accountId,
    user:req.user._id
});
console.log("account",account);
if(!account){
    return res.status(404).json({message:"Account not found"});
}
const balance=await account.getBalance();
res.status(200).json({balance});
}
module.exports={createAccount,getAllAccounts,getAccountBalance};
const mongoose=require("mongoose");

const acccountSchema = new  mongoose.Schema({
  fromAccount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"account",
    required:true,
    index:true
  },
  toAccount:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"account",  
    required:true,
    index:true
  },
  status:{
    type:String,
    enum:
    {
        values:["pending","completed","failed","reversed"],
        message:"Status must be either pending, completed, failed or reversed"
  },
    default:"pending",
    },
    amount:{
        type:Number,
        required:true,
        min:[0.01,"Amount must be at least 0.01"]
    },
    idempotencyKey:{
        type:String,
        required:true,
        unique:true,
        index:true
    }
},{
    timestamps:true
})

const transactionModel=mongoose.model("transaction",acccountSchema);

module.exports=transactionModel;
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:[true,"Email must be unique"],
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Please provide a valid email"]
    },
    name:{
        type:String,
        required:[true,"Name is required"],
        minlength:[3,"Name must be at least 3 characters long"]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[5,"Password must be at least 5 characters long"],
        select:false
    },
    systemUser:{
        type:Boolean,
        default:false,
        select:false
    }
},{timestamps:true});

userSchema.pre("save",async function(){
    if(!this.isModified("password")){
        return;
    }   
    const hash=await bcrypt.hash(this.password,10);
    this.password=hash;
    return;
});

userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

const userModel=mongoose.model("bank-users",userSchema);

module.exports=userModel;
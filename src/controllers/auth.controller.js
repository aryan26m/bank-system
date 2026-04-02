const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailService=require("../services/email.sevice");
const blackListModel = require("../models/blackList.model");

async function registerUser(req, res) {
  const { email, name, password } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (isEmailExist) {
    return res.status(422).json({ message: "Email already exists" });
  }

  const user = await userModel.create({ email, name, password});

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  res.cookie("token", token);

  res
    .status(201)
    .json({ message: "User registered successfully", user, token: token });

    await emailService.sendRegistrationEmail(email,name);
}

async function loginUser(req,res){
    const {email,password}=req.body;
    const user=await userModel.findOne({email}).select("+password");
    if(!user){
        return res.status(401).json({message:"Invalid email or password"});
    }
   const isValidPassword =  user.comparePassword(password);
   if(!isValidPassword){
    return res.status(401).json({message:"Invalid email or password"});
   }
   const token=jwt.sign({
    id:user._id
    },process.env.JWT_SECRET,{expiresIn:"3d"
   });
   
   res.cookie("token",token);

    res.status(200).json({message:"User logged in successfully",user,token:token});
}

async function logoutUser(req,res){
const token=req.cookies.token;
if(!token){
    return res.status(400).json({message:"No token found"});  
}
res.cookie("token","");
res.clearCookie("token");
const blackListToken=await blackListModel.create({token:token});
res.status(200).json({message:"User logged out successfully"}); 
}
module.exports = {
  registerUser,
  loginUser,
  logoutUser
};

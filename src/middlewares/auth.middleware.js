const userModel = require("../models/user.model");

const jwt=require("jsonwebtoken");
const blackListModel = require("../models/blackList.model");


async function authMiddleware(req,res,next){
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    const isBlackListed=await blackListModel.findOne({token:token});
    if(isBlackListed){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(decoded.id);
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user=user;
        next();
    }catch(error){
        return res.status(401).json({message:"Unauthorized"});
    }
}

async function authSystemUserMiddleware(req,res,next){
const token=req.cookies.token;
if(!token){
    return res.status(401).json({message:"Unauthorized"});
}
const isBlackListed=await blackListModel.findOne({token:token});
if(isBlackListed){
    return res.status(401).json({message:"Unauthorized"});
} 
try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id).select("+systemUser email name");

    if(!user){
        return res.status(401).json({message:"Unauthorized"});
    }
    console.log(user);
    const isSystemUser = user.systemUser === true;
    if(!isSystemUser){
        return res.status(401).json({message:"Unauthorized"});
    }
    req.user=user;
    next();

}catch(error){
    return res.status(401).json({message:"Unauthorized"});
}
}

module.exports={authMiddleware,authSystemUserMiddleware};
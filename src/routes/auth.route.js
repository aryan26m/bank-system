const express=require('express');
const router=express.Router();
const AuthController=require("../controllers/auth.controller");


router.post("/register",AuthController.registerUser);
//login route  
router.post("/login",AuthController.loginUser); 

//logout route

router.post("/logout",AuthController.logoutUser);


module.exports=router;
const express=require('express');
const authMiddleware = require("../middlewares/auth.middleware");


const router=express.Router();

//controller
const accountController=require("../controllers/account.controller");



router.post("/",authMiddleware.authMiddleware,accountController.createAccount);

//get all account of a user

router.get("/",authMiddleware.authMiddleware,accountController.getAllAccounts);

//get account balamce

router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalance);
module.exports=router;
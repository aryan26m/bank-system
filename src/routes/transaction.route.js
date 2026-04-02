const express=require("express");

const router=express.Router();

//controller
const transactionController=require("../controllers/transaction.controller");

//middlewares
const authMiddleware=require("../middlewares/auth.middleware");

//routes
router.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);


//systemroute
router.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction);
module.exports=router;
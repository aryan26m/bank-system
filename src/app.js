const express=require('express');
const cookieParser=require("cookie-parser");
const app=express();
app.use(express.json());
app.use(cookieParser());
//require routes
const AuthRouter=require("./routes/auth.route");
const AccountRouter=require("./routes/account.router");
const TransactionRouter=require("./routes/transaction.route");
//uses routesss
app.use("/api/auth",AuthRouter);
app.use("/api/accounts",AccountRouter);
app.use("/api/transactions",TransactionRouter);
module.exports=app;
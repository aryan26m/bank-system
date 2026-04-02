const mongoose=require("mongoose");
const dns = require("dns");

 function connectDb(){
const dnsServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(",").map((server) => server.trim()).filter(Boolean)
    : [];

if (dnsServers.length) {
    dns.setServers(dnsServers);
}

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB",err);
    process.exit(1); 
});
}
module.exports=connectDb;
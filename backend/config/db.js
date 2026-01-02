const mongoose=require('mongoose');


const MONGO_URL=process.env.MONGO_URL;

const connectDB=async()=>{
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to Db");
    } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
    }
}

module.exports=connectDB;
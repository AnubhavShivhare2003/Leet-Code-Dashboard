const express=require('express');
const cors=require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { router: leetcodeRoutes, checkAndRunStartupUpdate } = require('./routers/leetcodeRoutes');
const userRoutes=require('./routers/userRoutes');



const app=express();

// Enable CORS
const allowedOrigins = [
  'https://leet-code-dashboard-eight.vercel.app/',
  'http://localhost:5173',
  process.env.FRONTEND_URL // Add production frontend URL via env
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use("/api/leetcode",leetcodeRoutes);
app.use("/api/users",userRoutes);
app.get("/",(req,res)=>{
    res.json({message:"Api is working"});
})

const PORT=process.env.PORT || 4000;

// Connect to Database and then start server
connectDB().then(() => {
    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
        // Run startup check for LeetCode data
        checkAndRunStartupUpdate();
    });
}).catch(err => {
    console.error('Failed to connect to database', err);
    process.exit(1);
});
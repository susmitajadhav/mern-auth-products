import express from "express";
import connectDB from "./DB/db.js";
import cors from 'cors'
import productRoutes from './controllers/productController.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import dotenv from "dotenv";
import cookieParser from  'cookie-parser'
dotenv.config();


const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,
  })
);

app.use(cookieParser())

app.use('/api',productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// health check (interviewers love this)
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});


connectDB().then(()=>{
  app.listen(process.env.PORT, () => {
  console.log(`server got conncted port ${process.env.PORT} sucessfully`);
});
}
    
).catch(
(err)=>{
 console.error(err.message);
  
}
)




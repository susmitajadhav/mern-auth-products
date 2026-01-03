import express from "express";
import connectDB from "./DB/db.js";
import cors from 'cors'
import productRoutes from './controllers/productController.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import dotenv from "dotenv";
import cookieParser from  'cookie-parser'
dotenv.config();
const port = process.env.PORT || 3000

const app = express();

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal Server Error",
  });
});



connectDB().then(()=>{
  app.listen(port, () => {
  console.log(`server got conncted port ${port} sucessfully`);
});
}
    
).catch(
(err)=>{
 console.error(err.message);
  
}
)




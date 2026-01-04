import express from "express";
import connectDB from "./DB/db.js";
import cors from "cors";
import productRoutes from "./controllers/productController.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
const port = process.env.PORT || 3000;

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://susmitajadhav.github.io",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 👇 THIS LINE IS MANDATORY
app.options(/.*/, cors());

app.use(cookieParser());
app.use(express.json());

app.use("/api", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// health check (interviewers love this)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server got conncted port ${port} sucessfully`);
    });
  })
  .catch((err) => {
    console.error(err.message);
  });

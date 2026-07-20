import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import prisma from "./config/database.js";
import userRouter from "./routers/user.router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({ message: "TeamFlow API is running" });
});

app.use("/api/users", userRouter);

const start = async () => {
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

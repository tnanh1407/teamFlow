import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import User from "./models/user.model.js";
import users from "./data/user.data.js";

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    console.log("Cleared existing users");

    await User.insertMany(users);
    console.log("Seeded 2 users successfully");

    console.log("---");
    console.log("Admin: admin / admin123");
    console.log("User:  user  / user123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();

import dotenv from "dotenv";
import prisma from "./config/database.js";
import users from "./data/user.data.js";

dotenv.config();

const seed = async () => {
  try {
    await prisma.user.deleteMany();

    for (const user of users) {
      await prisma.user.create({ data: user });
    }

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

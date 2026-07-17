import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { EUserRole } from "../enums/user-role.enum.js";

const users = [
  {
    _id: new mongoose.Types.ObjectId(),
    employeeId: "EMP001",
    username: "admin",
    password: bcrypt.hashSync("admin123", 10),
    role: EUserRole.ADMIN,
    status: true,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    employeeId: "EMP002",
    username: "user",
    password: bcrypt.hashSync("user123", 10),
    role: EUserRole.USER,
    status: true,
  },
];

export default users;

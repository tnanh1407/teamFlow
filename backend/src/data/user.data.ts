import bcrypt from "bcryptjs";
import { EUserRole } from "../enums/user-role.enum.js";

const users = [
  {
    employeeId: "EMP001",
    username: "root",
    password: bcrypt.hashSync("root123", 10),
    role: EUserRole.SUPER_ADMIN,
    status: true,
  },
  {
    employeeId: "EMP001",
    username: "admin",
    password: bcrypt.hashSync("admin123", 10),
    role: EUserRole.ADMIN,
    status: true,
  },
  {
    employeeId: "EMP002",
    username: "user",
    password: bcrypt.hashSync("user123", 10),
    role: EUserRole.USER,
    status: true,
  },
];

export default users;

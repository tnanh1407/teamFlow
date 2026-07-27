import bcrypt from "bcryptjs";
import { EUserRole, EUserPosition } from "../enums/user-role.enum.js";

const users = [
  {
    employeeId: "EMP001",
    username: "admin",
    password: bcrypt.hashSync("admin123", 10),
    role: EUserRole.ADMIN,
    position: EUserPosition.ADMIN,
    status: true,
  },
  {
    employeeId: "EMP002",
    username: "user",
    password: bcrypt.hashSync("user123", 10),
    role: EUserRole.USER,
    position: EUserPosition.MEMBER,
    status: true,
  },
];

export default users;

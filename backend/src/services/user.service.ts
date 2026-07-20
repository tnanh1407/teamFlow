import prisma from "../config/database.js";
import bcrypt from "bcryptjs";
import { EUserRole } from "../enums/user-role.enum.js";

class UserService {
  async findAll() {
    return prisma.user.findMany({
      select: { id: true, employeeId: true, username: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, employeeId: true, username: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async findByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  }

  async findByEmployeeId(employeeId: string) {
    return prisma.user.findUnique({ where: { employeeId } });
  }

  async create(data: {
    employeeId: string;
    username: string;
    password: string;
    role?: EUserRole;
    status?: boolean;
  }) {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmployee = await this.findByEmployeeId(data.employeeId);
    if (existingEmployee) {
      throw new Error("Employee ID already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, employeeId: true, username: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async update(
    id: string,
    data: Partial<{
      employeeId: string;
      username: string;
      password: string;
      role: EUserRole;
      status: boolean;
    }>
  ) {
    if (data.username) {
      const existing = await this.findByUsername(data.username);
      if (existing && existing.id !== id) {
        throw new Error("Username already exists");
      }
    }

    if (data.employeeId) {
      const existing = await this.findByEmployeeId(data.employeeId);
      if (existing && existing.id !== id) {
        throw new Error("Employee ID already exists");
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, employeeId: true, username: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
  }

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}

export default new UserService();

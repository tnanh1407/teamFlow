import User, { type IUser } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { EUserRole } from "../enums/user-role.enum.js";

class UserService {
  async findAll(): Promise<IUser[]> {
    return User.find().select("-password");
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).select("-password");
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username });
  }

  async findByEmployeeId(employeeId: string): Promise<IUser | null> {
    return User.findOne({ employeeId });
  }

  async create(data: {
    employeeId: string;
    username: string;
    password: string;
    role?: EUserRole;
    status?: boolean;
  }): Promise<IUser> {
    const existingUser = await this.findByUsername(data.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const existingEmployee = await this.findByEmployeeId(data.employeeId);
    if (existingEmployee) {
      throw new Error("Employee ID already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    const userObj = user.toObject();
    const { password: _, ...rest } = userObj;
    return rest as unknown as IUser;
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
  ): Promise<IUser | null> {
    if (data.username) {
      const existing = await this.findByUsername(data.username);
      if (existing && existing._id.toString() !== id) {
        throw new Error("Username already exists");
      }
    }

    if (data.employeeId) {
      const existing = await this.findByEmployeeId(data.employeeId);
      if (existing && existing._id.toString() !== id) {
        throw new Error("Employee ID already exists");
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return User.findByIdAndUpdate(id, data, { new: true }).select(
      "-password"
    );
  }

  async delete(id: string): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }

  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new UserService();

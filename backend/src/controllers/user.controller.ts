import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userService from "../services/user.service.js";
import env from "../config/env.js";
import { comparePassword } from "../utils/auth/auth.comparePassword.js";
import { AppError } from "../utils/errors/app-error.js";

class UserController {
  async getAll(_req: Request, res: Response) {
    const users = await userService.findAll();
    res.json({ data: users });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await userService.findById(id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ data: user });
  }

  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    res.status(201).json({ data: user });
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await userService.update(id, req.body);
    if (!user) throw new AppError("User not found", 404);
    res.json({ data: user });
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await userService.delete(id);
    if (!user) throw new AppError("User not found", 404);
    res.json({ message: "User deleted successfully" });
  }

  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const user = await userService.findByUsername(username);

    if (!user) throw new AppError("Invalid credentials", 401);
    if (!user.status) throw new AppError("Account is disabled", 403);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new AppError("Invalid credentials", 401);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  }
}

export default new UserController();

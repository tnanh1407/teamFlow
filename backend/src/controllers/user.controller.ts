import { Request, Response } from "express";
import userService from "../services/user.service.js";
import jwt from "jsonwebtoken";
import { comparePassword } from "../utils/auth/auth.comparePassword.js";

class UserController {
  async getAll(_req: Request, res: Response) {
    try {
      const users = await userService.findAll();
      res.json({ data: users });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await userService.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ data: user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ data: user });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await userService.update(id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ data: user });
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await userService.delete(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const user = await userService.findByUsername(username);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.status) {
        return res.status(403).json({ message: "Account is disabled" });
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "teamflow-secret",
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  }
}

export default new UserController();

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../utils/db";
import type { User } from "../types";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
      [username, email, passwordHash, full_name]
    );

    res
      .status(201)
      .json({
        message: "User registered successfully",
        userId: result.insertId,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const user = users[0] as User;
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: { id: user.user_id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// utils/auth.utils.ts - Authentication Helper Functions
// ============================================================

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/index.js";

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
export const generateToken = (
  payload: JwtPayload,
  expiresIn: string = "7d"
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET not configured");
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }

  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET not configured");
  }

  return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as JwtPayload;
};

/**
 * Decode token without verification
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

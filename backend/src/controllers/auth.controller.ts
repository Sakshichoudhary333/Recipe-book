// ============================================================
// controllers/auth.controller.ts - Authentication Controller
// ============================================================

import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { pool } from "../utils/db.js";
import {
  sendSuccess,
  sendBadRequest,
  sendUnauthorized,
  executeQuery,
  executeQuerySingle,
  executeInsert,
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
} from "../utils/index.js";

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
      f_name,
      l_name,
      city,
      state,
      street,
      phone_no,
      phone_type,
    } = req.body;

    // Check if user already exists
    const existingUser = await executeQuerySingle(
      pool,
      "SELECT uid FROM user WHERE email = ?",
      [email]
    );

    if (existingUser) {
      return sendBadRequest(res, "Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const userId = await executeInsert(
      pool,
      `INSERT INTO user (email, password, f_name, l_name, city, state, street) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        hashedPassword,
        f_name,
        l_name,
        city || null,
        state || null,
        street || null,
      ]
    );

    // Insert phone number if provided
    if (phone_no) {
      await executeInsert(
        pool,
        "INSERT INTO user_phone (uid, phone_no, phone_type, is_primary) VALUES (?, ?, ?, ?)",
        [userId, phone_no, phone_type || "mobile", true]
      );
    }

    // Create customer record
    await executeInsert(pool, "INSERT INTO customer (UID) VALUES (?)", [
      userId,
    ]);

    // Generate token
    const token = generateToken({ uid: userId, email, role: "customer" });
    const refreshToken = generateRefreshToken({
      uid: userId,
      email,
      role: "customer",
    });

    // Get created user
    const user = await executeQuerySingle(
      pool,
      "SELECT uid, email, f_name, l_name, city, state, street, profile_image, bio, created_at FROM user WHERE uid = ?",
      [userId]
    );

    return sendSuccess(
      res,
      { user, token, refreshToken },
      "User registered successfully",
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const user = await executeQuerySingle<any>(
      pool,
      "SELECT u.*, e.Role FROM user u LEFT JOIN employee e ON u.uid = e.UID WHERE u.email = ?",
      [email]
    );

    if (!user) {
      return sendUnauthorized(res, "Invalid email or password");
    }

    if (!user.is_active) {
      return sendUnauthorized(res, "Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return sendUnauthorized(res, "Invalid email or password");
    }

    // Update last login
    await executeQuery(
      pool,
      "UPDATE user SET last_login = NOW() WHERE uid = ?",
      [user.uid]
    );

    // Generate tokens
    const role = user.Role || "customer";
    const token = generateToken({ uid: user.uid, email: user.email, role });
    const refreshToken = generateRefreshToken({
      uid: user.uid,
      email: user.email,
      role,
    });

    // Remove password from response
    delete user.password;
    delete user.Role;

    return sendSuccess(
      res,
      { user, token, refreshToken, role },
      "Login successful"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // In a production app, you would invalidate the token here
    // For now, we'll just return success (client should remove token)
    return sendSuccess(res, null, "Logout successful");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
      return sendBadRequest(res, "Refresh token is required");
    }

    // In production, verify the refresh token and check if it's valid
    // For now, we'll generate new tokens
    // You would typically decode the refresh token and validate it

    return sendSuccess(
      res,
      { message: "Token refresh not fully implemented" },
      "Refresh token endpoint"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await executeQuerySingle(
      pool,
      "SELECT uid, email FROM user WHERE email = ?",
      [email]
    );

    if (!user) {
      // Don't reveal if email exists or not for security
      return sendSuccess(
        res,
        null,
        "If the email exists, a password reset link has been sent"
      );
    }

    // In production, generate reset token and send email
    // For now, return success message
    return sendSuccess(
      res,
      null,
      "If the email exists, a password reset link has been sent"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendBadRequest(res, "Token and new password are required");
    }

    // In production, verify the reset token
    // For now, return placeholder response
    return sendSuccess(
      res,
      null,
      "Password reset functionality not fully implemented"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.uid;

    if (!currentPassword || !newPassword) {
      return sendBadRequest(
        res,
        "Current password and new password are required"
      );
    }

    // Get user with password
    const user = await executeQuerySingle<any>(
      pool,
      "SELECT password FROM user WHERE uid = ?",
      [userId]
    );

    if (!user) {
      return sendUnauthorized(res, "User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return sendUnauthorized(res, "Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await executeQuery(pool, "UPDATE user SET password = ? WHERE uid = ?", [
      hashedPassword,
      userId,
    ]);

    return sendSuccess(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

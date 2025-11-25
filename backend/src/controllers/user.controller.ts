// ============================================================
// controllers/user.controller.ts - User Management Controller
// ============================================================

import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { pool } from "../utils/db.js";
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
  executeQuery,
  executeQuerySingle,
  executeUpdate,
  generateUniqueFilename,
} from "../utils/index.js";

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;

    const user = await executeQuerySingle(
      pool,
      `SELECT u.uid, u.email, u.f_name, u.l_name, u.city, u.state, u.street, 
              u.profile_image, u.bio, u.created_at, u.last_login,
              e.Role, c.dietary_preferences, c.favorite_cuisines
       FROM user u
       LEFT JOIN employee e ON u.uid = e.UID
       LEFT JOIN customer c ON u.uid = c.UID
       WHERE u.uid = ?`,
      [userId]
    );

    if (!user) {
      return sendNotFound(res, "User not found");
    }

    // Get phone numbers
    const phones = await executeQuery(
      pool,
      "SELECT phone_no, phone_type, is_primary FROM user_phone WHERE uid = ?",
      [userId]
    );

    return sendSuccess(
      res,
      { ...user, phones },
      "Profile retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;
    const {
      f_name,
      l_name,
      city,
      state,
      street,
      bio,
      dietary_preferences,
      favorite_cuisines,
    } = req.body;

    // Update user table
    if (f_name || l_name || city || state || street || bio) {
      const updates: string[] = [];
      const values: any[] = [];

      if (f_name) {
        updates.push("f_name = ?");
        values.push(f_name);
      }
      if (l_name) {
        updates.push("l_name = ?");
        values.push(l_name);
      }
      if (city !== undefined) {
        updates.push("city = ?");
        values.push(city);
      }
      if (state !== undefined) {
        updates.push("state = ?");
        values.push(state);
      }
      if (street !== undefined) {
        updates.push("street = ?");
        values.push(street);
      }
      if (bio !== undefined) {
        updates.push("bio = ?");
        values.push(bio);
      }

      if (updates.length > 0) {
        values.push(userId);
        await executeUpdate(
          pool,
          `UPDATE user SET ${updates.join(", ")} WHERE uid = ?`,
          values
        );
      }
    }

    // Update customer preferences if provided
    if (dietary_preferences !== undefined || favorite_cuisines !== undefined) {
      const updates: string[] = [];
      const values: any[] = [];

      if (dietary_preferences !== undefined) {
        updates.push("dietary_preferences = ?");
        values.push(dietary_preferences);
      }
      if (favorite_cuisines !== undefined) {
        updates.push("favorite_cuisines = ?");
        values.push(favorite_cuisines);
      }

      if (updates.length > 0) {
        values.push(userId);
        await executeUpdate(
          pool,
          `UPDATE customer SET ${updates.join(", ")} WHERE UID = ?`,
          values
        );
      }
    }

    // Get updated profile
    const updatedUser = await executeQuerySingle(
      pool,
      `SELECT u.uid, u.email, u.f_name, u.l_name, u.city, u.state, u.street, 
              u.profile_image, u.bio, c.dietary_preferences, c.favorite_cuisines
       FROM user u
       LEFT JOIN customer c ON u.uid = c.UID
       WHERE u.uid = ?`,
      [userId]
    );

    return sendSuccess(res, updatedUser, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/users/profile/image
 * @desc    Upload profile image
 * @access  Private
 */
export const uploadProfileImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;
    const file = req.file;

    if (!file) {
      return sendBadRequest(res, "No file uploaded");
    }

    const imageUrl = `/uploads/${file.filename}`;

    // Update user profile image
    await executeUpdate(
      pool,
      "UPDATE user SET profile_image = ? WHERE uid = ?",
      [imageUrl, userId]
    );

    return sendSuccess(
      res,
      { profile_image: imageUrl },
      "Profile image uploaded successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await executeQuerySingle(
      pool,
      `SELECT u.uid, u.f_name, u.l_name, u.profile_image, u.bio, u.created_at,
              e.Role
       FROM user u
       LEFT JOIN employee e ON u.uid = e.UID
       WHERE u.uid = ? AND u.is_active = TRUE`,
      [id]
    );

    if (!user) {
      return sendNotFound(res, "User not found");
    }

    return sendSuccess(res, user, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id/recipes
 * @desc    Get user's recipes
 * @access  Public
 */
export const getUserRecipes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.pagination || {};

    // Ensure limit and offset are numbers
    const limitNum = parseInt(String(limit), 10) || 10;
    const pageNum = parseInt(String(page), 10) || 1;
    const offset = (pageNum - 1) * limitNum;

    const recipes = await executeQuery(
      pool,
      `SELECT r.RID, r.name, r.description, r.image_url, r.prep_time, r.cook_time,
              r.difficulty_level, r.average_rating, r.total_ratings, r.view_count, r.created_date
       FROM recipe r
       WHERE r.uid = ? AND r.is_published = TRUE
       ORDER BY r.created_date DESC
       LIMIT ${limitNum} OFFSET ${offset}`,
      [id]
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM recipe WHERE uid = ? AND is_published = TRUE",
      [id]
    );

    return sendSuccess(
      res,
      recipes,
      "User recipes retrieved successfully",
      200,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id/favorites
 * @desc    Get user's favorite recipes
 * @access  Private
 */
export const getUserFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;

    // Only allow users to see their own favorites
    if (!id || parseInt(id) !== userId) {
      return sendForbidden(res, "You can only view your own favorites");
    }

    const favorites = await executeQuery(
      pool,
      `SELECT r.RID, r.name, r.description, r.image_url, r.prep_time, r.cook_time,
              r.difficulty_level, r.average_rating, r.total_ratings, uf.added_date
       FROM user_favorites uf
       JOIN recipe r ON uf.RID = r.RID
       WHERE uf.uid = ?
       ORDER BY uf.added_date DESC`,
      [id]
    );

    return sendSuccess(res, favorites, "Favorites retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Public
 */
export const getUserStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const [stats] = await executeQuery<any>(
      pool,
      "CALL sp_get_user_recipe_stats(?)",
      [id]
    );

    return sendSuccess(
      res,
      stats[0][0],
      "User statistics retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account
 * @access  Private (self or admin)
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const userRole = req.user!.role;

    // Only allow users to delete their own account or admin to delete any
    if (!id || (parseInt(id) !== userId && userRole !== "admin")) {
      return sendForbidden(res, "You can only delete your own account");
    }

    await executeUpdate(pool, "DELETE FROM user WHERE uid = ?", [id]);

    return sendSuccess(res, null, "User account deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (admin)
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const users = await executeQuery(
      pool,
      `SELECT u.uid, u.email, u.f_name, u.l_name, u.created_at, u.last_login, u.is_active,
              e.Role
       FROM user u
       LEFT JOIN employee e ON u.uid = e.UID
       ORDER BY u.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${offset}`
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM user"
    );

    return sendSuccess(res, users, "Users retrieved successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// controllers/category.controller.ts - Category Management Controller
// ============================================================

import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { pool } from "../utils/db.js";
import {
  sendSuccess,
  sendNotFound,
  sendPaginatedResponse,
  executeQuery,
  executeQuerySingle,
  executeInsert,
  executeUpdate,
} from "../utils/index.js";

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { CName, Meal_Type, cuisine_type, description } = req.body;

    const categoryId = await executeInsert(
      pool,
      "INSERT INTO CATEGORY (CName, Meal_Type, cuisine_type, description) VALUES (?, ?, ?, ?)",
      [CName, Meal_Type || null, cuisine_type || null, description || null]
    );

    const category = await executeQuerySingle(
      pool,
      "SELECT * FROM CATEGORY WHERE CID = ?",
      [categoryId]
    );

    return sendSuccess(res, category, "Category created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await executeQuery(
      pool,
      "SELECT * FROM CATEGORY WHERE is_active = TRUE ORDER BY CName"
    );

    return sendSuccess(res, categories, "Categories retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const category = await executeQuerySingle(
      pool,
      "SELECT * FROM CATEGORY WHERE CID = ?",
      [id]
    );

    if (!category) {
      return sendNotFound(res, "Category not found");
    }

    return sendSuccess(res, category, "Category retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getRecipesByCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.pagination || {};

    const [results] = await executeQuery<any>(
      pool,
      "CALL sp_get_recipes_by_category(?)",
      [id]
    );

    const recipes = results[0] || [];

    return sendSuccess(res, recipes, "Recipes retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { CName, Meal_Type, cuisine_type, description, is_active } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (CName) {
      updates.push("CName = ?");
      values.push(CName);
    }
    if (Meal_Type !== undefined) {
      updates.push("Meal_Type = ?");
      values.push(Meal_Type);
    }
    if (cuisine_type !== undefined) {
      updates.push("cuisine_type = ?");
      values.push(cuisine_type);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeUpdate(
        pool,
        `UPDATE CATEGORY SET ${updates.join(", ")} WHERE CID = ?`,
        values
      );
    }

    const category = await executeQuerySingle(
      pool,
      "SELECT * FROM CATEGORY WHERE CID = ?",
      [id]
    );

    return sendSuccess(res, category, "Category updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await executeUpdate(pool, "DELETE FROM CATEGORY WHERE CID = ?", [id]);

    return sendSuccess(res, null, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};

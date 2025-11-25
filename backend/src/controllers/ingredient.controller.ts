// ============================================================
// controllers/ingredient.controller.ts - Ingredient Management Controller
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

export const createIngredient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      I_Name,
      Unit,
      Quantity,
      calories_per_unit,
      allergen_info,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
    } = req.body;

    const ingredientId = await executeInsert(
      pool,
      `INSERT INTO INGREDIENT (I_Name, Unit, Quantity, calories_per_unit, allergen_info, is_vegetarian, is_vegan, is_gluten_free)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        I_Name,
        Unit || null,
        Quantity || null,
        calories_per_unit || null,
        allergen_info || null,
        is_vegetarian !== false,
        is_vegan === true,
        is_gluten_free !== false,
      ]
    );

    const ingredient = await executeQuerySingle(
      pool,
      "SELECT * FROM INGREDIENT WHERE IID = ?",
      [ingredientId]
    );

    return sendSuccess(res, ingredient, "Ingredient created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getAllIngredients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const ingredients = await executeQuery(
      pool,
      `SELECT * FROM INGREDIENT ORDER BY I_Name LIMIT ${Number(
        limit
      )} OFFSET ${offset}`
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM INGREDIENT"
    );

    return sendPaginatedResponse(
      res,
      ingredients,
      page,
      limit,
      total,
      "Ingredients retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const searchIngredients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query) {
      return sendSuccess(res, [], "No search query provided");
    }

    const ingredients = await executeQuery(
      pool,
      "SELECT * FROM INGREDIENT WHERE I_Name LIKE ? ORDER BY I_Name LIMIT 20",
      [`%${query}%`]
    );

    return sendSuccess(res, ingredients, "Ingredients retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getIngredientById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const ingredient = await executeQuerySingle(
      pool,
      "SELECT * FROM INGREDIENT WHERE IID = ?",
      [id]
    );

    if (!ingredient) {
      return sendNotFound(res, "Ingredient not found");
    }

    return sendSuccess(res, ingredient, "Ingredient retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateIngredient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      I_Name,
      Unit,
      Quantity,
      calories_per_unit,
      allergen_info,
      is_vegetarian,
      is_vegan,
      is_gluten_free,
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (I_Name) {
      updates.push("I_Name = ?");
      values.push(I_Name);
    }
    if (Unit !== undefined) {
      updates.push("Unit = ?");
      values.push(Unit);
    }
    if (Quantity !== undefined) {
      updates.push("Quantity = ?");
      values.push(Quantity);
    }
    if (calories_per_unit !== undefined) {
      updates.push("calories_per_unit = ?");
      values.push(calories_per_unit);
    }
    if (allergen_info !== undefined) {
      updates.push("allergen_info = ?");
      values.push(allergen_info);
    }
    if (is_vegetarian !== undefined) {
      updates.push("is_vegetarian = ?");
      values.push(is_vegetarian);
    }
    if (is_vegan !== undefined) {
      updates.push("is_vegan = ?");
      values.push(is_vegan);
    }
    if (is_gluten_free !== undefined) {
      updates.push("is_gluten_free = ?");
      values.push(is_gluten_free);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeUpdate(
        pool,
        `UPDATE INGREDIENT SET ${updates.join(", ")} WHERE IID = ?`,
        values
      );
    }

    const ingredient = await executeQuerySingle(
      pool,
      "SELECT * FROM INGREDIENT WHERE IID = ?",
      [id]
    );

    return sendSuccess(res, ingredient, "Ingredient updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteIngredient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await executeUpdate(pool, "DELETE FROM INGREDIENT WHERE IID = ?", [id]);

    return sendSuccess(res, null, "Ingredient deleted successfully");
  } catch (error) {
    next(error);
  }
};

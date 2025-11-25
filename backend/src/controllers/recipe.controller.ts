// ============================================================
// controllers/recipe.controller.ts - Recipe Management Controller
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
  executeInsert,
  executeUpdate,
  executeTransaction,
  sendPaginatedResponse,
} from "../utils/index.js";

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 * @access  Private
 */
export const createRecipe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;
    const {
      name,
      description,
      prep_time,
      cook_time,
      servings,
      difficulty_level,
      instructions,
      is_published,
      categories,
      ingredients,
    } = req.body;

    const recipeId = await executeTransaction(pool, async (connection) => {
      // Insert recipe
      const [result] = await connection.execute(
        `INSERT INTO recipe (uid, name, description, prep_time, cook_time, servings, difficulty_level, instructions, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          name,
          description || null,
          prep_time || null,
          cook_time || null,
          servings || 1,
          difficulty_level || "Medium",
          instructions || null,
          is_published !== false,
        ]
      );
      const rid = (result as any).insertId;

      // Insert categories
      if (categories && categories.length > 0) {
        for (const cid of categories) {
          await connection.execute(
            "INSERT INTO RECIPECATEGORY (RID, CID) VALUES (?, ?)",
            [rid, cid]
          );
        }
      }

      // Insert ingredients
      if (ingredients && ingredients.length > 0) {
        for (let i = 0; i < ingredients.length; i++) {
          const ing = ingredients[i];
          await connection.execute(
            "INSERT INTO RECIPE_INGREDIENT (RID, IID, quantity, unit, notes, display_order) VALUES (?, ?, ?, ?, ?, ?)",
            [rid, ing.IID, ing.quantity, ing.unit, ing.notes || null, i]
          );
        }
      }

      return rid;
    });

    const recipe = await executeQuerySingle(
      pool,
      "SELECT * FROM recipe WHERE RID = ?",
      [recipeId]
    );

    return sendSuccess(res, recipe, "Recipe created successfully", 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes (with pagination and filters)
 * @access  Public
 */
export const getAllRecipes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    const { difficulty_level, category_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT DISTINCT r.RID, r.name, r.description, r.image_url, r.prep_time, r.cook_time,
             r.difficulty_level, r.average_rating, r.total_ratings, r.view_count, r.created_date,
             u.f_name, u.l_name
      FROM recipe r
      LEFT JOIN user u ON r.uid = u.uid
    `;
    const conditions: string[] = ["r.is_published = TRUE"];
    const params: any[] = [];

    if (category_id) {
      query += " INNER JOIN RECIPECATEGORY rc ON r.RID = rc.RID";
      conditions.push("rc.CID = ?");
      params.push(category_id);
    }

    if (difficulty_level) {
      conditions.push("r.difficulty_level = ?");
      params.push(difficulty_level);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ` ORDER BY r.created_date DESC LIMIT ${Number(
      limit
    )} OFFSET ${offset}`;

    const recipes = await executeQuery(pool, query, params);

    // Get total count
    let countQuery = "SELECT COUNT(DISTINCT r.RID) as total FROM recipe r";
    const countParams: any[] = [];

    if (category_id) {
      countQuery += " INNER JOIN RECIPECATEGORY rc ON r.RID = rc.RID";
    }

    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
      if (category_id) countParams.push(category_id);
      if (difficulty_level) countParams.push(difficulty_level);
    }

    const [{ total }] = await executeQuery<any>(pool, countQuery, countParams);

    return sendPaginatedResponse(
      res,
      recipes,
      page,
      limit,
      total,
      "Recipes retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recipes/popular
 * @desc    Get popular recipes
 * @access  Public
 */
export const getPopularRecipes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const recipes = await executeQuery(
      pool,
      `SELECT * FROM vw_popular_recipes LIMIT ${Number(limit)} OFFSET ${offset}`
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM vw_popular_recipes"
    );

    return sendPaginatedResponse(
      res,
      recipes,
      page,
      limit,
      total,
      "Popular recipes retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recipes/recent
 * @desc    Get recent recipes
 * @access  Public
 */
export const getRecentRecipes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const recipes = await executeQuery(
      pool,
      `SELECT * FROM vw_recent_recipes LIMIT ${Number(limit)} OFFSET ${offset}`
    );

    return sendSuccess(res, recipes, "Recent recipes retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/recipes/:id
 * @desc    Get recipe by ID with full details
 * @access  Public
 */
export const getRecipeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const [results] = await executeQuery<any>(
      pool,
      "CALL sp_get_recipe_details(?)",
      [id]
    );

    if (!results[0] || results[0].length === 0) {
      return sendNotFound(res, "Recipe not found");
    }

    const recipe = results[0][0];
    const categories = results[1] || [];
    const ingredients = results[2] || [];
    const feedbacks = results[3] || [];

    // Check if user has favorited this recipe
    let isFavorited = false;
    if (userId) {
      const favorite = await executeQuerySingle(
        pool,
        "SELECT 1 FROM user_favorites WHERE uid = ? AND RID = ?",
        [userId, id]
      );
      isFavorited = !!favorite;
    }

    return sendSuccess(
      res,
      {
        ...recipe,
        categories,
        ingredients,
        feedbacks,
        is_favorited: isFavorited,
      },
      "Recipe retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update recipe
 * @access  Private (owner or admin)
 */
export const updateRecipe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const userRole = req.user!.role;

    // Check ownership
    const recipe = await executeQuerySingle<any>(
      pool,
      "SELECT uid FROM recipe WHERE RID = ?",
      [id]
    );

    if (!recipe) {
      return sendNotFound(res, "Recipe not found");
    }

    if (recipe.uid !== userId && userRole !== "admin") {
      return sendForbidden(res, "You can only update your own recipes");
    }

    const {
      name,
      description,
      prep_time,
      cook_time,
      servings,
      difficulty_level,
      instructions,
      is_published,
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (prep_time !== undefined) {
      updates.push("prep_time = ?");
      values.push(prep_time);
    }
    if (cook_time !== undefined) {
      updates.push("cook_time = ?");
      values.push(cook_time);
    }
    if (servings !== undefined) {
      updates.push("servings = ?");
      values.push(servings);
    }
    if (difficulty_level) {
      updates.push("difficulty_level = ?");
      values.push(difficulty_level);
    }
    if (instructions !== undefined) {
      updates.push("instructions = ?");
      values.push(instructions);
    }
    if (is_published !== undefined) {
      updates.push("is_published = ?");
      values.push(is_published);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeUpdate(
        pool,
        `UPDATE recipe SET ${updates.join(", ")} WHERE RID = ?`,
        values
      );
    }

    const updatedRecipe = await executeQuerySingle(
      pool,
      "SELECT * FROM recipe WHERE RID = ?",
      [id]
    );

    return sendSuccess(res, updatedRecipe, "Recipe updated successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete recipe
 * @access  Private (owner or admin)
 */
export const deleteRecipe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const userRole = req.user!.role;

    const recipe = await executeQuerySingle<any>(
      pool,
      "SELECT uid FROM recipe WHERE RID = ?",
      [id]
    );

    if (!recipe) {
      return sendNotFound(res, "Recipe not found");
    }

    if (recipe.uid !== userId && userRole !== "admin") {
      return sendForbidden(res, "You can only delete your own recipes");
    }

    await executeUpdate(pool, "DELETE FROM recipe WHERE RID = ?", [id]);

    return sendSuccess(res, null, "Recipe deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/recipes/:id/image
 * @desc    Upload recipe image
 * @access  Private (owner)
 */
export const uploadRecipeImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const file = req.file;

    if (!file) {
      return sendBadRequest(res, "No file uploaded");
    }

    const recipe = await executeQuerySingle<any>(
      pool,
      "SELECT uid FROM recipe WHERE RID = ?",
      [id]
    );

    if (!recipe) {
      return sendNotFound(res, "Recipe not found");
    }

    if (recipe.uid !== userId) {
      return sendForbidden(
        res,
        "You can only upload images to your own recipes"
      );
    }

    const imageUrl = `/uploads/${file.filename}`;

    await executeUpdate(pool, "UPDATE recipe SET image_url = ? WHERE RID = ?", [
      imageUrl,
      id,
    ]);

    return sendSuccess(
      res,
      { image_url: imageUrl },
      "Recipe image uploaded successfully"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/recipes/:id/favorite
 * @desc    Add recipe to favorites
 * @access  Private
 */
export const addToFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;

    // Check if recipe exists
    const recipe = await executeQuerySingle(
      pool,
      "SELECT RID FROM recipe WHERE RID = ?",
      [id]
    );

    if (!recipe) {
      return sendNotFound(res, "Recipe not found");
    }

    // Check if already favorited
    const existing = await executeQuerySingle(
      pool,
      "SELECT 1 FROM user_favorites WHERE uid = ? AND RID = ?",
      [userId, id]
    );

    if (existing) {
      return sendBadRequest(res, "Recipe already in favorites");
    }

    await executeInsert(
      pool,
      "INSERT INTO user_favorites (uid, RID) VALUES (?, ?)",
      [userId, id]
    );

    return sendSuccess(res, null, "Recipe added to favorites");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/recipes/:id/favorite
 * @desc    Remove recipe from favorites
 * @access  Private
 */
export const removeFromFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;

    await executeUpdate(
      pool,
      "DELETE FROM user_favorites WHERE uid = ? AND RID = ?",
      [userId, id]
    );

    return sendSuccess(res, null, "Recipe removed from favorites");
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/recipes/:id/publish
 * @desc    Publish/unpublish recipe
 * @access  Private (owner)
 */
export const togglePublish = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;

    const recipe = await executeQuerySingle<any>(
      pool,
      "SELECT uid, is_published FROM recipe WHERE RID = ?",
      [id]
    );

    if (!recipe) {
      return sendNotFound(res, "Recipe not found");
    }

    if (recipe.uid !== userId) {
      return sendForbidden(res, "You can only publish your own recipes");
    }

    const newStatus = !recipe.is_published;

    await executeUpdate(
      pool,
      "UPDATE recipe SET is_published = ? WHERE RID = ?",
      [newStatus, id]
    );

    return sendSuccess(
      res,
      { is_published: newStatus },
      `Recipe ${newStatus ? "published" : "unpublished"} successfully`
    );
  } catch (error) {
    next(error);
  }
};

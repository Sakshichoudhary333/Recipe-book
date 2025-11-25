// ============================================================
// controllers/collection.controller.ts - Collection Management Controller
// ============================================================

import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { pool } from "../utils/db.js";
import {
  sendSuccess,
  sendNotFound,
  sendForbidden,
  sendBadRequest,
  sendPaginatedResponse,
  executeQuery,
  executeQuerySingle,
  executeInsert,
  executeUpdate,
} from "../utils/index.js";

export const createCollection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;
    const { collection_name, description, is_public } = req.body;

    const collectionId = await executeInsert(
      pool,
      "INSERT INTO collections (uid, collection_name, description, is_public) VALUES (?, ?, ?, ?)",
      [userId, collection_name, description || null, is_public === true]
    );

    const collection = await executeQuerySingle(
      pool,
      "SELECT * FROM collections WHERE collection_id = ?",
      [collectionId]
    );

    return sendSuccess(res, collection, "Collection created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getUserCollections = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const collections = await executeQuery(
      pool,
      `SELECT c.*, COUNT(cr.RID) as recipe_count
       FROM collections c
       LEFT JOIN collection_recipes cr ON c.collection_id = cr.collection_id
       WHERE c.uid = ?
       GROUP BY c.collection_id
       ORDER BY c.created_at DESC
       ORDER BY c.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${offset}`,
      [userId]
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM collections WHERE uid = ?",
      [userId]
    );

    return sendPaginatedResponse(
      res,
      collections,
      page,
      limit,
      total,
      "Collections retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicCollections = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const collections = await executeQuery(
      pool,
      `SELECT c.*, u.f_name, u.l_name, COUNT(cr.RID) as recipe_count
       FROM collections c
       LEFT JOIN user u ON c.uid = u.uid
       LEFT JOIN collection_recipes cr ON c.collection_id = cr.collection_id
       WHERE c.is_public = TRUE
       GROUP BY c.collection_id
       ORDER BY c.created_at DESC
       ORDER BY c.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${offset}`
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM collections WHERE is_public = TRUE"
    );

    return sendPaginatedResponse(
      res,
      collections,
      page,
      limit,
      total,
      "Public collections retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getCollectionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const collection = await executeQuerySingle<any>(
      pool,
      `SELECT c.*, u.f_name, u.l_name
       FROM collections c
       LEFT JOIN user u ON c.uid = u.uid
       WHERE c.collection_id = ?`,
      [id]
    );

    if (!collection) {
      return sendNotFound(res, "Collection not found");
    }

    // Check if user can access this collection
    if (!collection.is_public && collection.uid !== userId) {
      return sendForbidden(res, "You do not have access to this collection");
    }

    return sendSuccess(res, collection, "Collection retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const { collection_name, description, is_public } = req.body;

    const collection = await executeQuerySingle<any>(
      pool,
      "SELECT uid FROM collections WHERE collection_id = ?",
      [id]
    );

    if (!collection) {
      return sendNotFound(res, "Collection not found");
    }

    if (collection.uid !== userId) {
      return sendForbidden(res, "You can only update your own collections");
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (collection_name) {
      updates.push("collection_name = ?");
      values.push(collection_name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (is_public !== undefined) {
      updates.push("is_public = ?");
      values.push(is_public);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeUpdate(
        pool,
        `UPDATE collections SET ${updates.join(", ")} WHERE collection_id = ?`,
        values
      );
    }

    const updatedCollection = await executeQuerySingle(
      pool,
      "SELECT * FROM collections WHERE collection_id = ?",
      [id]
    );

    return sendSuccess(
      res,
      updatedCollection,
      "Collection updated successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;

    const collection = await executeQuerySingle<any>(
      pool,
      "SELECT uid FROM collections WHERE collection_id = ?",
      [id]
    );

    if (!collection) {
      return sendNotFound(res, "Collection not found");
    }

    if (collection.uid !== userId) {
      return sendForbidden(res, "You can only delete your own collections");
    }

    await executeUpdate(
      pool,
      "DELETE FROM collections WHERE collection_id = ?",
      [id]
    );

    return sendSuccess(res, null, "Collection deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const addRecipeToCollection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const { RID, display_order } = req.body;

    const collection = await executeQuerySingle<any>(
      pool,
      "SELECT uid FROM collections WHERE collection_id = ?",
      [id]
    );

    if (!collection) {
      return sendNotFound(res, "Collection not found");
    }

    if (collection.uid !== userId) {
      return sendForbidden(
        res,
        "You can only add recipes to your own collections"
      );
    }

    // Check if recipe exists
    const recipe = await executeQuerySingle(
      pool,
      "SELECT RID FROM recipe WHERE RID = ?",
      [RID]
    );
    if (!recipe) {
      return sendNotFound(res, "Recipe not found");
    }

    // Check if already in collection
    const existing = await executeQuerySingle(
      pool,
      "SELECT 1 FROM collection_recipes WHERE collection_id = ? AND RID = ?",
      [id, RID]
    );

    if (existing) {
      return sendBadRequest(res, "Recipe already in collection");
    }

    await executeInsert(
      pool,
      "INSERT INTO collection_recipes (collection_id, RID, display_order) VALUES (?, ?, ?)",
      [id, RID, display_order || 0]
    );

    return sendSuccess(res, null, "Recipe added to collection successfully");
  } catch (error) {
    next(error);
  }
};

export const removeRecipeFromCollection = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, recipeId } = req.params;
    const userId = req.user!.uid;

    const collection = await executeQuerySingle<any>(
      pool,
      "SELECT uid FROM collections WHERE collection_id = ?",
      [id]
    );

    if (!collection) {
      return sendNotFound(res, "Collection not found");
    }

    if (collection.uid !== userId) {
      return sendForbidden(
        res,
        "You can only remove recipes from your own collections"
      );
    }

    await executeUpdate(
      pool,
      "DELETE FROM collection_recipes WHERE collection_id = ? AND RID = ?",
      [id, recipeId]
    );

    return sendSuccess(
      res,
      null,
      "Recipe removed from collection successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getCollectionRecipes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const collection = await executeQuerySingle<any>(
      pool,
      "SELECT uid, is_public FROM collections WHERE collection_id = ?",
      [id]
    );

    if (!collection) {
      return sendNotFound(res, "Collection not found");
    }

    if (!collection.is_public && collection.uid !== userId) {
      return sendForbidden(res, "You do not have access to this collection");
    }

    const recipes = await executeQuery(
      pool,
      `SELECT r.*, cr.display_order, cr.added_date
       FROM collection_recipes cr
       JOIN recipe r ON cr.RID = r.RID
       WHERE cr.collection_id = ?
       ORDER BY cr.display_order, cr.added_date DESC
       ORDER BY cr.display_order, cr.added_date DESC
       LIMIT ${Number(limit)} OFFSET ${offset}`,
      [id]
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM collection_recipes WHERE collection_id = ?",
      [id]
    );

    return sendPaginatedResponse(
      res,
      recipes,
      page,
      limit,
      total,
      "Collection recipes retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

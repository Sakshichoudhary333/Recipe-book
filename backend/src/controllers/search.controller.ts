// ============================================================
// controllers/search.controller.ts - Search Controller
// ============================================================

import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import { pool } from "../utils/db.js";
import {
  sendSuccess,
  sendPaginatedResponse,
  executeQuery,
} from "../utils/index.js";

export const searchRecipes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    const {
      query,
      search_type = "both",
      category_id,
      difficulty_level,
      max_prep_time,
      max_cook_time,
      min_rating,
      sort_by = "rating",
      sort_order = "desc",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build search query
    let sqlQuery = `
      SELECT DISTINCT r.RID, r.name, r.description, r.image_url, r.prep_time, r.cook_time,
             r.difficulty_level, r.average_rating, r.total_ratings, r.view_count, r.created_date,
             u.f_name, u.l_name
      FROM recipe r
      LEFT JOIN user u ON r.uid = u.uid
    `;

    const conditions: string[] = ["r.is_published = TRUE"];
    const params: any[] = [];

    // Search by name or ingredients
    if (query) {
      if (search_type === "name") {
        conditions.push("r.name LIKE ?");
        params.push(`%${query}%`);
      } else if (search_type === "ingredient") {
        sqlQuery +=
          " INNER JOIN RECIPE_INGREDIENT ri ON r.RID = ri.RID INNER JOIN INGREDIENT i ON ri.IID = i.IID";
        conditions.push("i.I_Name LIKE ?");
        params.push(`%${query}%`);
      } else {
        sqlQuery +=
          " LEFT JOIN RECIPE_INGREDIENT ri ON r.RID = ri.RID LEFT JOIN INGREDIENT i ON ri.IID = i.IID";
        conditions.push("(r.name LIKE ? OR i.I_Name LIKE ?)");
        params.push(`%${query}%`, `%${query}%`);
      }
    }

    // Filter by category
    if (category_id) {
      sqlQuery += " INNER JOIN RECIPECATEGORY rc ON r.RID = rc.RID";
      conditions.push("rc.CID = ?");
      params.push(category_id);
    }

    // Filter by difficulty
    if (difficulty_level) {
      conditions.push("r.difficulty_level = ?");
      params.push(difficulty_level);
    }

    // Filter by prep time
    if (max_prep_time) {
      conditions.push("r.prep_time <= ?");
      params.push(max_prep_time);
    }

    // Filter by cook time
    if (max_cook_time) {
      conditions.push("r.cook_time <= ?");
      params.push(max_cook_time);
    }

    // Filter by rating
    if (min_rating) {
      conditions.push("r.average_rating >= ?");
      params.push(min_rating);
    }

    if (conditions.length > 0) {
      sqlQuery += " WHERE " + conditions.join(" AND ");
    }

    // Sorting
    const validSortFields: Record<string, string> = {
      rating: "r.average_rating",
      date: "r.created_date",
      views: "r.view_count",
      name: "r.name",
    };

    const sortField = validSortFields[sort_by as string] || "r.average_rating";
    const sortDirection = sort_order === "asc" ? "ASC" : "DESC";

    sqlQuery += ` ORDER BY ${sortField} ${sortDirection} LIMIT ${Number(
      limit
    )} OFFSET ${offset}`;

    const recipes = await executeQuery(pool, sqlQuery, params);

    // Get total count (simplified for performance)
    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(DISTINCT r.RID) as total FROM recipe r WHERE r.is_published = TRUE"
    );

    return sendPaginatedResponse(
      res,
      recipes,
      page,
      limit,
      total,
      "Search results retrieved successfully"
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

export const searchCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query) {
      return sendSuccess(res, [], "No search query provided");
    }

    const categories = await executeQuery(
      pool,
      "SELECT * FROM CATEGORY WHERE CName LIKE ? OR cuisine_type LIKE ? ORDER BY CName LIMIT 20",
      [`%${query}%`, `%${query}%`]
    );

    return sendSuccess(res, categories, "Categories retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query) {
      return sendSuccess(res, [], "No search query provided");
    }

    const users = await executeQuery(
      pool,
      `SELECT uid, f_name, l_name, profile_image, bio
       FROM user
       WHERE (f_name LIKE ? OR l_name LIKE ?) AND is_active = TRUE
       ORDER BY f_name, l_name
       LIMIT 20`,
      [`%${query}%`, `%${query}%`]
    );

    return sendSuccess(res, users, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const advancedSearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 10 } = req.pagination || {};
    // Advanced search with POST body for complex criteria
    // This is a placeholder for more complex search logic
    return sendSuccess(res, [], "Advanced search not fully implemented");
  } catch (error) {
    next(error);
  }
};

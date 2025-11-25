// ============================================================
// controllers/feedback.controller.ts - Feedback/Review Controller
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

export const createFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;
    const { RID, Rating, Comment_Text } = req.body;

    // Check if recipe exists
    const recipe = await executeQuerySingle(
      pool,
      "SELECT RID FROM recipe WHERE RID = ?",
      [RID]
    );
    if (!recipe) {
      return sendNotFound(res, "Recipe not found");
    }

    const feedbackId = await executeInsert(
      pool,
      "INSERT INTO feedback (UID, RID, Rating, Comment_Text) VALUES (?, ?, ?, ?)",
      [userId, RID, Rating || null, Comment_Text || null]
    );

    const feedback = await executeQuerySingle(
      pool,
      "SELECT * FROM feedback WHERE FID = ?",
      [feedbackId]
    );

    return sendSuccess(res, feedback, "Feedback created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getRecipeFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const feedbacks = await executeQuery(
      pool,
      `SELECT f.*, u.f_name, u.l_name, u.profile_image
       FROM feedback f
       LEFT JOIN user u ON f.UID = u.uid
       WHERE f.RID = ? AND f.is_flagged = FALSE
       ORDER BY f.F_Date DESC
       LIMIT ${Number(limit)} OFFSET ${offset}`,
      [id]
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM feedback WHERE RID = ? AND is_flagged = FALSE",
      [id]
    );

    return sendPaginatedResponse(
      res,
      feedbacks,
      page,
      limit,
      total,
      "Feedback retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getUserFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.pagination || {};
    const offset = (page - 1) * limit;

    const feedbacks = await executeQuery(
      pool,
      `SELECT f.*, r.name as recipe_name, r.image_url as recipe_image
       FROM feedback f
       LEFT JOIN recipe r ON f.RID = r.RID
       WHERE f.UID = ?
       ORDER BY f.F_Date DESC
       LIMIT ${Number(limit)} OFFSET ${offset}`,
      [id]
    );

    const [{ total }] = await executeQuery<any>(
      pool,
      "SELECT COUNT(*) as total FROM feedback WHERE UID = ?",
      [id]
    );

    return sendPaginatedResponse(
      res,
      feedbacks,
      page,
      limit,
      total,
      "User feedback retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const getFeedbackById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const feedback = await executeQuerySingle(
      pool,
      `SELECT f.*, u.f_name, u.l_name, r.name as recipe_name
       FROM feedback f
       LEFT JOIN user u ON f.UID = u.uid
       LEFT JOIN recipe r ON f.RID = r.RID
       WHERE f.FID = ?`,
      [id]
    );

    if (!feedback) {
      return sendNotFound(res, "Feedback not found");
    }

    return sendSuccess(res, feedback, "Feedback retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const { Rating, Comment_Text } = req.body;

    const feedback = await executeQuerySingle<any>(
      pool,
      "SELECT UID FROM feedback WHERE FID = ?",
      [id]
    );

    if (!feedback) {
      return sendNotFound(res, "Feedback not found");
    }

    if (feedback.UID !== userId) {
      return sendForbidden(res, "You can only update your own feedback");
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (Rating !== undefined) {
      updates.push("Rating = ?");
      values.push(Rating);
    }
    if (Comment_Text !== undefined) {
      updates.push("Comment_Text = ?");
      values.push(Comment_Text);
    }

    if (updates.length > 0) {
      values.push(id);
      await executeUpdate(
        pool,
        `UPDATE feedback SET ${updates.join(", ")} WHERE FID = ?`,
        values
      );
    }

    const updatedFeedback = await executeQuerySingle(
      pool,
      "SELECT * FROM feedback WHERE FID = ?",
      [id]
    );

    return sendSuccess(res, updatedFeedback, "Feedback updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.uid;
    const userRole = req.user!.role;

    const feedback = await executeQuerySingle<any>(
      pool,
      "SELECT UID FROM feedback WHERE FID = ?",
      [id]
    );

    if (!feedback) {
      return sendNotFound(res, "Feedback not found");
    }

    if (feedback.UID !== userId && userRole !== "admin") {
      return sendForbidden(res, "You can only delete your own feedback");
    }

    await executeUpdate(pool, "DELETE FROM feedback WHERE FID = ?", [id]);

    return sendSuccess(res, null, "Feedback deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await executeUpdate(
      pool,
      "UPDATE feedback SET helpful_count = helpful_count + 1 WHERE FID = ?",
      [id]
    );

    return sendSuccess(res, null, "Feedback marked as helpful");
  } catch (error) {
    next(error);
  }
};

export const flagFeedback = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await executeUpdate(
      pool,
      "UPDATE feedback SET is_flagged = TRUE WHERE FID = ?",
      [id]
    );

    return sendSuccess(res, null, "Feedback flagged successfully");
  } catch (error) {
    next(error);
  }
};

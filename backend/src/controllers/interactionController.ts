import type { Response } from "express";
import { pool } from "../utils/db";
import type { AuthRequest } from "../types";
import type { RowDataPacket } from "mysql2";

export const addRating = async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const { rating } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    // Check if user already rated
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT rating_id FROM recipe_ratings WHERE recipe_id = ? AND user_id = ?",
      [recipeId, userId]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE recipe_ratings SET rating = ? WHERE rating_id = ?",
        [rating, existing[0]!.rating_id]
      );
      res.json({ message: "Rating updated" });
    } else {
      await pool.query(
        "INSERT INTO recipe_ratings (recipe_id, user_id, rating) VALUES (?, ?, ?)",
        [recipeId, userId, rating]
      );
      res.status(201).json({ message: "Rating added" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { recipeId } = req.params;
    const { comment_text } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!comment_text) {
      res.status(400).json({ message: "Comment text is required" });
      return;
    }

    await pool.query(
      "INSERT INTO recipe_comments (recipe_id, user_id, comment_text) VALUES (?, ?, ?)",
      [recipeId, userId, comment_text]
    );

    res.status(201).json({ message: "Comment added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

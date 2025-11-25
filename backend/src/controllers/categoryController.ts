import type { Request, Response } from "express";
import { pool } from "../utils/db";

export const getCuisines = async (req: Request, res: Response) => {
  try {
    const [cuisines] = await pool.query("SELECT * FROM cuisines");
    res.json(cuisines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMealTypes = async (req: Request, res: Response) => {
  try {
    const [mealTypes] = await pool.query("SELECT * FROM meal_types");
    res.json(mealTypes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

import type { Request, Response } from "express";
import { pool } from "../utils/db";
import type { AuthRequest, Recipe } from "../types";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export const createRecipe = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const {
      recipe_name,
      description,
      preparation_time,
      cooking_time,
      servings,
      difficulty_level,
      cuisine_id,
      meal_type_id,
      image_url,
      ingredients, // Array of { ingredient_name, quantity, unit, notes, category }
      instructions, // Array of { step_number, instruction_text }
    } = req.body;

  
    

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // 1. Insert Recipe
    const [recipeResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO recipes (
        user_id, recipe_name, description, preparation_time, cooking_time, 
        servings, difficulty_level, cuisine_id, meal_type_id, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        recipe_name,
        description,
        preparation_time,
        cooking_time,
        servings,
        difficulty_level,
        cuisine_id,
        meal_type_id,
        image_url,
      ]
    );

    const recipeId = recipeResult.insertId;

    // 2. Handle Ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        // Check if ingredient exists, else create
        let ingredientId;
        const [existingIng] = await connection.query<RowDataPacket[]>(
          "SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?",
          [ing.ingredient_name]
        );

        if (existingIng.length > 0) {
          ingredientId = existingIng[0]!.ingredient_id;
        } else {
          const [newIng] = await connection.query<ResultSetHeader>(
            "INSERT INTO ingredients (ingredient_name, category) VALUES (?, ?)",
            [ing.ingredient_name, ing.category]
          );
          ingredientId = newIng.insertId;
        }

        // Link to recipe
        await connection.query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [recipeId, ingredientId, ing.quantity, ing.unit, ing.notes]
        );
      }
    }

    // 3. Handle Instructions
    if (instructions && instructions.length > 0) {
      for (const inst of instructions) {
        await connection.query(
          `INSERT INTO recipe_instructions (recipe_id, step_number, instruction_text)
           VALUES (?, ?, ?)`,
          [recipeId, inst.step_number, inst.instruction_text]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Recipe created successfully", recipeId });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { search, cuisine_id, meal_type_id, difficulty_level } = req.query;

    let query = `
      SELECT r.*, u.username, c.cuisine_name, m.meal_type_name,
      (SELECT AVG(rating) FROM recipe_ratings WHERE recipe_id = r.recipe_id) as average_rating
      FROM recipes r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN cuisines c ON r.cuisine_id = c.cuisine_id
      LEFT JOIN meal_types m ON r.meal_type_id = m.meal_type_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      query += ` AND (MATCH(r.recipe_name, r.description) AGAINST(? IN NATURAL LANGUAGE MODE) 
                 OR EXISTS (
                   SELECT 1 FROM recipe_ingredients ri 
                   JOIN ingredients i ON ri.ingredient_id = i.ingredient_id 
                   WHERE ri.recipe_id = r.recipe_id AND MATCH(i.ingredient_name) AGAINST(? IN NATURAL LANGUAGE MODE)
                 ))`;
      params.push(search, search);
    }

    if (cuisine_id) {
      query += " AND r.cuisine_id = ?";
      params.push(cuisine_id);
    }

    if (meal_type_id) {
      query += " AND r.meal_type_id = ?";
      params.push(meal_type_id);
    }

    if (difficulty_level) {
      query += " AND r.difficulty_level = ?";
      params.push(difficulty_level);
    }

    query += " ORDER BY r.created_at DESC";

    const [recipes] = await pool.query(query, params);
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const recipeId = req.params.id;

    const [recipes] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, u.username, c.cuisine_name, m.meal_type_name,
      (SELECT AVG(rating) FROM recipe_ratings WHERE recipe_id = r.recipe_id) as average_rating
       FROM recipes r
       JOIN users u ON r.user_id = u.user_id
       LEFT JOIN cuisines c ON r.cuisine_id = c.cuisine_id
       LEFT JOIN meal_types m ON r.meal_type_id = m.meal_type_id
       WHERE r.recipe_id = ?`,
      [recipeId]
    );

    if (recipes.length === 0) {
      res.status(404).json({ message: "Recipe not found" });
      return;
    }

    const recipe = recipes[0];

    // Fetch ingredients
    const [ingredients] = await pool.query(
      `SELECT ri.*, i.ingredient_name, i.category 
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
       WHERE ri.recipe_id = ?`,
      [recipeId]
    );

    // Fetch instructions
    const [instructions] = await pool.query(
      `SELECT * FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number ASC`,
      [recipeId]
    );

    // Fetch comments
    const [comments] = await pool.query(
      `SELECT rc.*, u.username 
       FROM recipe_comments rc
       JOIN users u ON rc.user_id = u.user_id
       WHERE rc.recipe_id = ?
       ORDER BY rc.created_at DESC`,
      [recipeId]
    );

    res.json({ ...recipe, ingredients, instructions, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRecipe = async (req: AuthRequest, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const recipeId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Check ownership
    const [existing] = await connection.query<RowDataPacket[]>(
      "SELECT user_id FROM recipes WHERE recipe_id = ?",
      [recipeId]
    );

    if (existing.length === 0) {
      res.status(404).json({ message: "Recipe not found" });
      return;
    }

    const recipe = existing[0]!;
    if (recipe.user_id !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const {
      recipe_name,
      description,
      preparation_time,
      cooking_time,
      servings,
      difficulty_level,
      cuisine_id,
      meal_type_id,
      image_url,
      ingredients,
      instructions,
    } = req.body;

    // Update Recipe details
    await connection.query(
      `UPDATE recipes SET 
       recipe_name = ?, description = ?, preparation_time = ?, cooking_time = ?, 
       servings = ?, difficulty_level = ?, cuisine_id = ?, meal_type_id = ?, image_url = ?
       WHERE recipe_id = ?`,
      [
        recipe_name,
        description,
        preparation_time,
        cooking_time,
        servings,
        difficulty_level,
        cuisine_id,
        meal_type_id,
        image_url,
        recipeId,
      ]
    );

    // Update Ingredients (Delete all and recreate - simplest approach for now)
    if (ingredients) {
      await connection.query(
        "DELETE FROM recipe_ingredients WHERE recipe_id = ?",
        [recipeId]
      );
      for (const ing of ingredients) {
        let ingredientId;
        const [existingIng] = await connection.query<RowDataPacket[]>(
          "SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?",
          [ing.ingredient_name]
        );

        if (existingIng.length > 0) {
          ingredientId = existingIng[0]!.ingredient_id;
        } else {
          const [newIng] = await connection.query<ResultSetHeader>(
            "INSERT INTO ingredients (ingredient_name, category) VALUES (?, ?)",
            [ing.ingredient_name, ing.category]
          );
          ingredientId = newIng.insertId;
        }

        await connection.query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [recipeId, ingredientId, ing.quantity, ing.unit, ing.notes]
        );
      }
    }

    // Update Instructions
    if (instructions) {
      await connection.query(
        "DELETE FROM recipe_instructions WHERE recipe_id = ?",
        [recipeId]
      );
      for (const inst of instructions) {
        await connection.query(
          `INSERT INTO recipe_instructions (recipe_id, step_number, instruction_text)
           VALUES (?, ?, ?)`,
          [recipeId, inst.step_number, inst.instruction_text]
        );
      }
    }

    await connection.commit();
    res.json({ message: "Recipe updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT user_id FROM recipes WHERE recipe_id = ?",
      [recipeId]
    );

    if (existing.length === 0) {
      res.status(404).json({ message: "Recipe not found" });
      return;
    }

    const recipe = existing[0]!;
    if (recipe.user_id !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    await pool.query("DELETE FROM recipes WHERE recipe_id = ?", [recipeId]);
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

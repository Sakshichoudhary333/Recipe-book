import type { Request } from "express";

export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Cuisine {
  cuisine_id: number;
  cuisine_name: string;
  description?: string;
}

export interface MealType {
  meal_type_id: number;
  meal_type_name: string;
  description?: string;
}

export interface Recipe {
  recipe_id: number;
  user_id: number;
  recipe_name: string;
  description?: string;
  preparation_time?: number;
  cooking_time?: number;
  servings?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
  cuisine_id?: number;
  meal_type_id?: number;
  image_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Ingredient {
  ingredient_id: number;
  ingredient_name: string;
  category?: string;
}

export interface RecipeIngredient {
  recipe_ingredient_id: number;
  recipe_id: number;
  ingredient_id: number;
  quantity?: number;
  unit?: string;
  notes?: string;
}

export interface RecipeInstruction {
  instruction_id: number;
  recipe_id: number;
  step_number: number;
  instruction_text: string;
}

export interface RecipeRating {
  rating_id: number;
  recipe_id: number;
  user_id: number;
  rating: number;
}

export interface RecipeComment {
  comment_id: number;
  recipe_id: number;
  user_id: number;
  comment_text: string;
  created_at?: Date;
  updated_at?: Date;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export interface TokenPayload {
  userId: number;
  email: string;
}

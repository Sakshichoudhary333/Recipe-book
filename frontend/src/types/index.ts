export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
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
  ingredient_name?: string; // Added from API response example
  category?: string; // Added from API response example
}

export interface RecipeInstruction {
  instruction_id: number;
  recipe_id: number;
  step_number: number;
  instruction_text: string;
}

export interface RecipeComment {
  comment_id: number;
  recipe_id: number;
  user_id: number;
  comment_text: string;
  created_at?: string;
  updated_at?: string;
  username?: string; // Added from API response example
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
  created_at?: string;
  updated_at?: string;
  username?: string; // Added from API response example
  cuisine_name?: string; // Added from API response example
  meal_type_name?: string; // Added from API response example
  average_rating?: number; // Added from API response example
  ingredients?: RecipeIngredient[];
  instructions?: RecipeInstruction[];
  comments?: RecipeComment[];
}

// Auth Types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// Recipe API Types
export interface GetRecipesParams {
  search?: string;
  cuisine_id?: number;
  meal_type_id?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
}

export interface CreateIngredientRequest {
  ingredient_name: string;
  category?: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface CreateInstructionRequest {
  step_number: number;
  instruction_text: string;
}

export interface CreateRecipeRequest {
  recipe_name: string;
  description?: string;
  preparation_time?: number;
  cooking_time?: number;
  servings?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
  cuisine_id?: number;
  meal_type_id?: number;
  image_url?: string;
  ingredients: CreateIngredientRequest[];
  instructions: CreateInstructionRequest[];
}

export interface CreateRecipeResponse {
  message: string;
  recipeId: number;
}

export type UpdateRecipeRequest = CreateRecipeRequest;

export interface UpdateRecipeResponse {
  message: string;
}

export interface DeleteRecipeResponse {
  message: string;
}

// Interaction Types
export interface RateRecipeRequest {
  rating: number;
}

export interface RateRecipeResponse {
  message: string;
}

export interface CommentRecipeRequest {
  comment_text: string;
}

export interface CommentRecipeResponse {
  message: string;
}

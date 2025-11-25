import type { User } from "../../types";

export interface Ingredient {
  IID: number;
  I_Name: string;
  quantity: number;
  unit: string;
  notes?: string;
  display_order: number;
}

export interface Category {
  CID: number;
  CName: string;
  Meal_Type?: string;
  cuisine_type?: string;
  description?: string;
  image_url?: string;
}

export interface Recipe {
  RID: number;
  uid?: number;
  name: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings: number;
  difficulty_level: "Easy" | "Medium" | "Hard";
  instructions?: string;
  image_url?: string;
  video_url?: string;
  created_date: string;
  updated_date: string;
  is_published: boolean;
  view_count: number;
  average_rating: number;
  total_ratings: number;
  author?: User;
  categories?: Category[];
  ingredients?: Ingredient[];
  is_favorited?: boolean;
  user_rating?: number;
}

export interface RecipeFilters {
  page?: number;
  limit?: number;
  category_id?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
  min_rating?: number;
  search?: string;
}

// ============================================================
// types/index.ts - Comprehensive Type Definitions
// ============================================================

import type { Request } from "express";

// ============================================================
// DATABASE SCHEMA TYPES
// ============================================================

export interface User {
  uid: number;
  email: string;
  f_name: string;
  l_name: string;
  city?: string;
  state?: string;
  street?: string;
  password: string;
  profile_image?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  last_login?: Date;
}

export interface UserPhone {
  uid: number;
  phone_no: string;
  phone_type: "mobile" | "home" | "work";
  is_primary: boolean;
}

export interface Customer {
  UID: number;
  dietary_preferences?: string;
  favorite_cuisines?: string;
}

export interface Employee {
  UID: number;
  Role: string;
  hire_date: Date;
  department?: string;
}

export interface Category {
  CID: number;
  CName: string;
  Meal_Type?: string;
  cuisine_type?: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
}

export interface Ingredient {
  IID: number;
  I_Name: string;
  Unit?: string;
  Quantity?: number;
  calories_per_unit?: number;
  allergen_info?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
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
  created_date: Date;
  updated_date: Date;
  is_published: boolean;
  view_count: number;
  average_rating: number;
  total_ratings: number;
}

export interface RecipeIngredient {
  RID: number;
  IID: number;
  quantity: number;
  unit: string;
  notes?: string;
  display_order: number;
}

export interface RecipeCategory {
  RID: number;
  CID: number;
  added_date: Date;
}

export interface Feedback {
  FID: number;
  UID?: number;
  RID?: number;
  Rating?: number;
  Comment_Text?: string;
  F_Date: Date;
  helpful_count: number;
  is_verified_purchase: boolean;
  is_flagged: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserFavorite {
  uid: number;
  RID: number;
  added_date: Date;
  notes?: string;
}

export interface Collection {
  collection_id: number;
  uid: number;
  collection_name: string;
  description?: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CollectionRecipe {
  collection_id: number;
  RID: number;
  added_date: Date;
  display_order: number;
}

// ============================================================
// API REQUEST TYPES (DTOs)
// ============================================================

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  f_name: string;
  l_name: string;
  city?: string;
  state?: string;
  street?: string;
  phone_no?: string;
  phone_type?: "mobile" | "home" | "work";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  f_name?: string;
  l_name?: string;
  city?: string;
  state?: string;
  street?: string;
  bio?: string;
  profile_image?: string;
}

// Recipe
export interface CreateRecipeRequest {
  name: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
  instructions?: string;
  image_url?: string;
  video_url?: string;
  is_published?: boolean;
  categories?: number[];
  ingredients?: {
    IID: number;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
}

export interface UpdateRecipeRequest {
  name?: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  servings?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
  instructions?: string;
  image_url?: string;
  video_url?: string;
  is_published?: boolean;
  categories?: number[];
  ingredients?: {
    IID: number;
    quantity: number;
    unit: string;
    notes?: string;
  }[];
}

export interface SearchRecipeRequest {
  query?: string;
  search_type?: "name" | "ingredient" | "both";
  category_id?: number;
  difficulty_level?: "Easy" | "Medium" | "Hard";
  max_prep_time?: number;
  max_cook_time?: number;
  min_rating?: number;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  page?: number;
  limit?: number;
  sort_by?: "rating" | "date" | "views" | "name";
  sort_order?: "asc" | "desc";
}

// Feedback
export interface CreateFeedbackRequest {
  RID: number;
  Rating?: number;
  Comment_Text?: string;
}

export interface UpdateFeedbackRequest {
  Rating?: number;
  Comment_Text?: string;
}

// Category
export interface CreateCategoryRequest {
  CName: string;
  Meal_Type?: string;
  cuisine_type?: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryRequest {
  CName?: string;
  Meal_Type?: string;
  cuisine_type?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

// Ingredient
export interface CreateIngredientRequest {
  I_Name: string;
  Unit?: string;
  Quantity?: number;
  calories_per_unit?: number;
  allergen_info?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
}

export interface UpdateIngredientRequest {
  I_Name?: string;
  Unit?: string;
  Quantity?: number;
  calories_per_unit?: number;
  allergen_info?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
}

// Collection
export interface CreateCollectionRequest {
  collection_name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateCollectionRequest {
  collection_name?: string;
  description?: string;
  is_public?: boolean;
}

export interface AddRecipeToCollectionRequest {
  RID: number;
  display_order?: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: ValidationError[];
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Auth Responses
export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken?: string;
}

export interface UserProfile {
  uid: number;
  email: string;
  f_name: string;
  l_name: string;
  city?: string;
  state?: string;
  street?: string;
  profile_image?: string;
  bio?: string;
  created_at: Date;
  is_active: boolean;
  role?: string; // from employee table if exists
}

// Recipe Responses
export interface RecipeDetailResponse extends Recipe {
  author?: {
    uid: number;
    f_name: string;
    l_name: string;
    profile_image?: string;
  };
  categories?: Category[];
  ingredients?: (RecipeIngredient & Ingredient)[];
  feedbacks?: (Feedback & { user?: { f_name: string; l_name: string } })[];
  is_favorited?: boolean;
  user_rating?: number;
}

export interface RecipeListResponse {
  recipes: RecipeDetailResponse[];
  meta: PaginationMeta;
}

// Statistics Responses
export interface UserStatsResponse {
  total_recipes: number;
  avg_rating_received: number;
  total_views: number;
  total_ratings_received: number;
  total_comments_given: number;
  total_favorites: number;
}

export interface RecipeStatsResponse {
  total_recipes: number;
  total_categories: number;
  total_ingredients: number;
  total_users: number;
  popular_recipes: Recipe[];
  recent_recipes: Recipe[];
}

// ============================================================
// EXTENDED REQUEST TYPES (with auth user)
// ============================================================

export interface AuthRequest extends Request {
  user?: {
    uid: number;
    email: string;
    role?: string;
  };
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type SortOrder = "asc" | "desc";
export type SearchType = "name" | "ingredient" | "both";
export type DifficultyLevel = "Easy" | "Medium" | "Hard";
export type PhoneType = "mobile" | "home" | "work";
export type UserRole = "admin" | "moderator" | "chef" | "user";

// ============================================================
// QUERY RESULT TYPES (from stored procedures)
// ============================================================

export interface RecipeSearchResult {
  RID: number;
  name: string;
  description?: string;
  image_url?: string;
  prep_time?: number;
  cook_time?: number;
  difficulty_level: DifficultyLevel;
  average_rating: number;
  total_ratings: number;
  view_count: number;
  created_date: Date;
  f_name?: string;
  l_name?: string;
  categories?: string;
}

// ============================================================
// ERROR TYPES
// ============================================================

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends AppError {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super("Validation failed", 400);
    this.errors = errors;
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenException extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundException extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictException extends AppError {
  constructor(message: string = "Resource already exists") {
    super(message, 409);
  }
}

// ============================================================
// MIDDLEWARE TYPES
// ============================================================

export interface JwtPayload {
  uid: number;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  destination?: string;
}

// ============================================================
// CONFIGURATION TYPES
// ============================================================

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  waitForConnections?: boolean;
  queueLimit?: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret?: string;
  refreshExpiresIn?: string;
}

export interface AppConfig {
  port: number;
  env: "development" | "production" | "test";
  database: DatabaseConfig;
  jwt: JwtConfig;
  corsOrigins: string[];
  uploadPath: string;
  maxFileSize: number;
}

// ============================================================
// SERVICE LAYER TYPES
// ============================================================

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  order: SortOrder;
}

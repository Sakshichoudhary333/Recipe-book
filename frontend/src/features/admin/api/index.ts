import api from "../../../api/axios";
import type { ApiResponse } from "../../../types";

// ============================================================
// TYPES
// ============================================================

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

export interface User {
  uid: number;
  email: string;
  f_name: string;
  l_name: string;
  city?: string;
  state?: string;
  street?: string;
  profile_image?: string;
  bio?: string;
  created_at: string;
  is_active: boolean;
  last_login?: string;
  Role?: string;
}

export interface CreateCategoryDto {
  CName: string;
  Meal_Type?: string;
  cuisine_type?: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  is_active?: boolean;
}

export interface CreateIngredientDto {
  I_Name: string;
  Unit?: string;
  Quantity?: number;
  calories_per_unit?: number;
  allergen_info?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
}

export type UpdateIngredientDto = Partial<CreateIngredientDto>;

// ============================================================
// CATEGORY API
// ============================================================

export const getCategories = async () => {
  const response = await api.get<ApiResponse<Category[]>>("/categories");
  return response.data;
};

export const getCategoryById = async (id: number) => {
  const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: CreateCategoryDto) => {
  const response = await api.post<ApiResponse<Category>>("/categories", data);
  return response.data;
};

export const updateCategory = async (id: number, data: UpdateCategoryDto) => {
  const response = await api.put<ApiResponse<Category>>(
    `/categories/${id}`,
    data
  );
  return response.data;
};

export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}`);
};

// ============================================================
// INGREDIENT API
// ============================================================

export const getIngredients = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<ApiResponse<Ingredient[]>>("/ingredients", {
    params,
  });
  return response.data;
};

export const searchIngredients = async (query: string) => {
  const response = await api.get<ApiResponse<Ingredient[]>>(
    "/ingredients/search",
    {
      params: { query },
    }
  );
  return response.data;
};

export const getIngredientById = async (id: number) => {
  const response = await api.get<ApiResponse<Ingredient>>(`/ingredients/${id}`);
  return response.data;
};

export const createIngredient = async (data: CreateIngredientDto) => {
  const response = await api.post<ApiResponse<Ingredient>>(
    "/ingredients",
    data
  );
  return response.data;
};

export const updateIngredient = async (
  id: number,
  data: UpdateIngredientDto
) => {
  const response = await api.put<ApiResponse<Ingredient>>(
    `/ingredients/${id}`,
    data
  );
  return response.data;
};

export const deleteIngredient = async (id: number) => {
  await api.delete(`/ingredients/${id}`);
};

// ============================================================
// USER API (Admin)
// ============================================================

export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get<ApiResponse<User[]>>("/users", { params });
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await api.get<ApiResponse<User>>(`/users/${id}`);
  return response.data;
};

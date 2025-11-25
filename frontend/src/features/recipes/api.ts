import api from "../../api/axios";
import type { ApiResponse } from "../../types";
import type { Recipe, RecipeFilters } from "./types";

export const getRecipes = async (filters: RecipeFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.category_id)
    params.append("category_id", filters.category_id.toString());
  if (filters.difficulty_level)
    params.append("difficulty_level", filters.difficulty_level);
  if (filters.min_rating)
    params.append("min_rating", filters.min_rating.toString());
  if (filters.search) params.append("search", filters.search);

  const response = await api.get<ApiResponse<Recipe[]>>(
    `/recipes?${params.toString()}`
  );
  return response.data;
};

export const getRecipe = async (id: number) => {
  const response = await api.get<ApiResponse<Recipe>>(`/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (recipe: Partial<Recipe>) => {
  const response = await api.post<ApiResponse<Recipe>>("/recipes", recipe);
  return response.data;
};

export const updateRecipe = async (id: number, recipe: Partial<Recipe>) => {
  const response = await api.put<ApiResponse<Recipe>>(`/recipes/${id}`, recipe);
  return response.data;
};

export const deleteRecipe = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/recipes/${id}`);
  return response.data;
};

export const uploadRecipeImage = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("recipe_image", file);
  const response = await api.post<ApiResponse<{ image_url: string }>>(
    `/recipes/${id}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

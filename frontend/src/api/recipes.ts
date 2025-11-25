import api from "./axios";
import type {
  Recipe,
  GetRecipesParams,
  CreateRecipeRequest,
  CreateRecipeResponse,
  UpdateRecipeRequest,
  UpdateRecipeResponse,
  DeleteRecipeResponse,
  RateRecipeRequest,
  RateRecipeResponse,
  CommentRecipeRequest,
  CommentRecipeResponse,
} from "../types";

export const getRecipes = async (
  params?: GetRecipesParams
): Promise<Recipe[]> => {
  const response = await api.get<Recipe[]>("/recipes", { params });
  return response.data;
};

export const getRecipeById = async (id: number): Promise<Recipe> => {
  const response = await api.get<Recipe>(`/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (
  data: CreateRecipeRequest
): Promise<CreateRecipeResponse> => {
  const response = await api.post<CreateRecipeResponse>("/recipes", data);
  return response.data;
};

export const updateRecipe = async (
  id: number,
  data: UpdateRecipeRequest
): Promise<UpdateRecipeResponse> => {
  const response = await api.put<UpdateRecipeResponse>(`/recipes/${id}`, data);
  return response.data;
};

export const deleteRecipe = async (
  id: number
): Promise<DeleteRecipeResponse> => {
  const response = await api.delete<DeleteRecipeResponse>(`/recipes/${id}`);
  return response.data;
};

export const rateRecipe = async (
  recipeId: number,
  data: RateRecipeRequest
): Promise<RateRecipeResponse> => {
  const response = await api.post<RateRecipeResponse>(
    `/recipes/${recipeId}/rate`,
    data
  );
  return response.data;
};

export const commentOnRecipe = async (
  recipeId: number,
  data: CommentRecipeRequest
): Promise<CommentRecipeResponse> => {
  const response = await api.post<CommentRecipeResponse>(
    `/recipes/${recipeId}/comment`,
    data
  );
  return response.data;
};

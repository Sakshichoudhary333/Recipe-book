import api from "../../api/axios";
import type { ApiResponse, User } from "../../types";
import type { Recipe } from "../recipes/types";

export const getUserProfile = async () => {
  const response = await api.get<ApiResponse<User>>("/users/profile");
  return response.data;
};

export const getMyRecipes = async () => {
  const response = await api.get<ApiResponse<Recipe[]>>("/users/recipes");
  return response.data;
};

export const updateUserProfile = async (data: Partial<User>) => {
  const response = await api.put<ApiResponse<User>>("/users/profile", data);
  return response.data;
};

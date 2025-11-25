import api from "./axios";
import type { Cuisine, MealType } from "../types";

export const getCuisines = async (): Promise<Cuisine[]> => {
  const response = await api.get<Cuisine[]>("/categories/cuisines");
  return response.data;
};

export const getMealTypes = async (): Promise<MealType[]> => {
  const response = await api.get<MealType[]>("/categories/meal-types");
  return response.data;
};

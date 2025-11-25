import type { Ingredient, CreateIngredientInput } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  const response = await fetch(
    `${API_BASE_URL}/ingredients/search?query=${encodeURIComponent(query)}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to search ingredients");
  }

  const data = await response.json();
  return data.data;
}

export async function getAllIngredients(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: Ingredient[]; meta: any }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const response = await fetch(
    `${API_BASE_URL}/ingredients?${queryParams.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch ingredients");
  }

  const result = await response.json();
  return { data: result.data, meta: result.meta };
}

export async function getIngredientById(id: number): Promise<Ingredient> {
  const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch ingredient");
  }

  const data = await response.json();
  return data.data;
}

export async function createIngredient(
  input: CreateIngredientInput
): Promise<Ingredient> {
  const response = await fetch(`${API_BASE_URL}/ingredients`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create ingredient");
  }

  const data = await response.json();
  return data.data;
}

export async function updateIngredient(
  id: number,
  input: Partial<CreateIngredientInput>
): Promise<Ingredient> {
  const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update ingredient");
  }

  const data = await response.json();
  return data.data;
}

export async function deleteIngredient(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete ingredient");
  }
}

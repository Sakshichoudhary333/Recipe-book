export interface Ingredient {
  IID: number;
  I_Name: string;
  Unit?: string;
  Quantity?: number;
  calories_per_unit?: number;
  allergen_info?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  created_date?: Date;
  updated_date?: Date;
}

export interface CreateIngredientInput {
  I_Name: string;
  Unit?: string;
  Quantity?: number;
  calories_per_unit?: number;
  allergen_info?: string;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
}

export interface RecipeIngredient {
  IID: number;
  I_Name: string;
  quantity: number;
  unit: string;
  notes?: string;
  display_order?: number;
}

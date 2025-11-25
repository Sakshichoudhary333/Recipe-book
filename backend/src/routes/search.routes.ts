// ============================================================
// routes/search.routes.ts - Search Routes
// ============================================================

import { Router } from "express";
import { searchRecipeValidation, pagination } from "../middlewares/index.js";
import {
  searchRecipes,
  searchIngredients,
  searchCategories,
  searchUsers,
  advancedSearch,
} from "../controllers/search.controller.js";

const router = Router();

router.get("/recipes", searchRecipeValidation, pagination, searchRecipes);
router.get("/ingredients", searchIngredients);
router.get("/categories", searchCategories);
router.get("/users", searchUsers);
router.post("/advanced", pagination, advancedSearch);

export default router;

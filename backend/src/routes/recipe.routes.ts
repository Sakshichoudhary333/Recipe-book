// ============================================================
// routes/recipe.routes.ts - Recipe Routes
// ============================================================

import { Router } from "express";
import {
  authenticate,
  optionalAuthenticate,
  createRecipeValidation,
  updateRecipeValidation,
  idValidation,
  uploadSingle,
  pagination,
} from "../middlewares/index.js";
import {
  createRecipe,
  getAllRecipes,
  getPopularRecipes,
  getRecentRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  uploadRecipeImage,
  addToFavorites,
  removeFromFavorites,
  togglePublish,
} from "../controllers/recipe.controller.js";

const router = Router();

router.post("/", authenticate, createRecipeValidation, createRecipe);
router.get("/", optionalAuthenticate, pagination, getAllRecipes);
router.get("/popular", pagination, getPopularRecipes);
router.get("/recent", pagination, getRecentRecipes);
router.get("/:id", optionalAuthenticate, idValidation, getRecipeById);
router.put("/:id", authenticate, updateRecipeValidation, updateRecipe);
router.delete("/:id", authenticate, idValidation, deleteRecipe);
router.post(
  "/:id/image",
  authenticate,
  idValidation,
  uploadSingle("recipe_image"),
  uploadRecipeImage
);
router.post("/:id/favorite", authenticate, idValidation, addToFavorites);
router.delete("/:id/favorite", authenticate, idValidation, removeFromFavorites);
router.post("/:id/publish", authenticate, idValidation, togglePublish);

export default router;

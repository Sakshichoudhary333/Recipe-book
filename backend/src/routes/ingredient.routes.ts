// ============================================================
// routes/ingredient.routes.ts - Ingredient Routes
// ============================================================

import { Router } from "express";
import {
  authenticate,
  authorize,
  createIngredientValidation,
  updateIngredientValidation,
  idValidation,
  pagination,
} from "../middlewares/index.js";
import {
  createIngredient,
  getAllIngredients,
  searchIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
} from "../controllers/ingredient.controller.js";

const router = Router();

router.post("/", authenticate, createIngredientValidation, createIngredient);
router.get("/", pagination, getAllIngredients);
router.get("/search", searchIngredients);
router.get("/:id", idValidation, getIngredientById);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "chef"),
  updateIngredientValidation,
  updateIngredient
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  deleteIngredient
);

export default router;

// ============================================================
// routes/category.routes.ts - Category Routes
// ============================================================

import { Router } from "express";
import {
  authenticate,
  authorize,
  createCategoryValidation,
  updateCategoryValidation,
  idValidation,
  pagination,
} from "../middlewares/index.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getRecipesByCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createCategoryValidation,
  createCategory
);
router.get("/", getAllCategories);
router.get("/:id", idValidation, getCategoryById);
router.get("/:id/recipes", idValidation, pagination, getRecipesByCategory);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateCategoryValidation,
  updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  deleteCategory
);

export default router;

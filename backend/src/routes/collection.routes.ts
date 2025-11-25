// ============================================================
// routes/collection.routes.ts - Collection Routes
// ============================================================

import { Router } from "express";
import {
  authenticate,
  createCollectionValidation,
  updateCollectionValidation,
  idValidation,
  pagination,
} from "../middlewares/index.js";
import {
  createCollection,
  getUserCollections,
  getPublicCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addRecipeToCollection,
  removeRecipeFromCollection,
  getCollectionRecipes,
} from "../controllers/collection.controller.js";

const router = Router();

router.post("/", authenticate, createCollectionValidation, createCollection);
router.get("/", authenticate, pagination, getUserCollections);
router.get("/public", pagination, getPublicCollections);
router.get("/:id", idValidation, getCollectionById);
router.put("/:id", authenticate, updateCollectionValidation, updateCollection);
router.delete("/:id", authenticate, idValidation, deleteCollection);
router.post("/:id/recipes", authenticate, idValidation, addRecipeToCollection);
router.delete(
  "/:id/recipes/:recipeId",
  authenticate,
  removeRecipeFromCollection
);
router.get("/:id/recipes", idValidation, pagination, getCollectionRecipes);

export default router;

// ============================================================
// routes/index.ts - Main Routes File
// ============================================================

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import recipeRoutes from "./recipe.routes.js";
import categoryRoutes from "./category.routes.js";
import ingredientRoutes from "./ingredient.routes.js";
import feedbackRoutes from "./feedback.routes.js";
import collectionRoutes from "./collection.routes.js";
import searchRoutes from "./search.routes.js";
import { generalLimiter } from "../middlewares/index.js";

const router = Router();

// Apply general rate limiting
router.use(generalLimiter);

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date(),
  });
});

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/recipes", recipeRoutes);
router.use("/categories", categoryRoutes);
router.use("/ingredients", ingredientRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/collections", collectionRoutes);
router.use("/search", searchRoutes);

export default router;

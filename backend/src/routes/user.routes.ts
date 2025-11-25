// ============================================================
// routes/user.routes.ts - User Routes
// ============================================================

import { Router } from "express";
import {
  authenticate,
  authorize,
  idValidation,
  uploadSingle,
} from "../middlewares/index.js";
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getUserById,
  getUserRecipes,
  getUserFavorites,
  getUserStats,
  deleteUser,
  getAllUsers,
} from "../controllers/user.controller.js";
import { type AuthRequest } from "../types/index.js";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.post(
  "/profile/image",
  authenticate,
  uploadSingle("profile_image"),
  uploadProfileImage
);

// Get current user's recipes - Must be before /:id routes
router.get("/recipes", authenticate, (req, res, next) => {
  const authReq = req as AuthRequest;
  if (authReq.user) {
    authReq.params.id = authReq.user.uid.toString();
  }
  getUserRecipes(authReq, res, next);
});

router.get("/:id", idValidation, getUserById);
router.get("/:id/recipes", idValidation, getUserRecipes);
router.get("/:id/favorites", authenticate, idValidation, getUserFavorites);
router.get("/:id/stats", idValidation, getUserStats);
router.delete("/:id", authenticate, idValidation, deleteUser);
router.get("/", authenticate, authorize("admin"), getAllUsers);

export default router;

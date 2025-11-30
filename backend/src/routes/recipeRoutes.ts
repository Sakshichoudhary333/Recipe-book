import multer from "multer";

// Define where to save uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // this folder must exist
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Create 'upload' using storage
const upload = multer({ storage });






import { Router } from "express";
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController";
import { addRating, addComment } from "../controllers/interactionController";
import { authenticateToken } from "../middleware/auth";
import { body } from "express-validator";

const router = Router();

router.get("/", getRecipes);
router.get("/:id", getRecipeById);

router.post(
  "/",
  authenticateToken,
  
  
  [
    body("recipe_name").notEmpty().trim(),
    body("ingredients").isArray(),
    body("instructions").isArray(),
  ],
  createRecipe
);

router.put("/:id", authenticateToken, updateRecipe);

router.delete("/:id", authenticateToken, deleteRecipe);

router.post(
  "/:recipeId/rate",
  authenticateToken,
  [body("rating").isInt({ min: 1, max: 5 })],
  addRating
);

router.post(
  "/:recipeId/comment",
  authenticateToken,
  [body("comment_text").notEmpty()],
  addComment
);

export default router;

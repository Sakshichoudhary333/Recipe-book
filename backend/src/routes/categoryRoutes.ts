import { Router } from "express";
import { getCuisines, getMealTypes } from "../controllers/categoryController";

const router = Router();

router.get("/cuisines", getCuisines);
router.get("/meal-types", getMealTypes);

export default router;

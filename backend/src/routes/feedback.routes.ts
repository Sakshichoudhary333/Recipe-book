// ============================================================
// routes/feedback.routes.ts - Feedback Routes
// ============================================================

import { Router } from "express";
import {
  authenticate,
  createFeedbackValidation,
  updateFeedbackValidation,
  idValidation,
  pagination,
} from "../middlewares/index.js";
import {
  createFeedback,
  getRecipeFeedback,
  getUserFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  markHelpful,
  flagFeedback,
} from "../controllers/feedback.controller.js";

const router = Router();

router.post("/", authenticate, createFeedbackValidation, createFeedback);
router.get("/recipe/:id", idValidation, pagination, getRecipeFeedback);
router.get("/user/:id", idValidation, pagination, getUserFeedback);
router.get("/:id", idValidation, getFeedbackById);
router.put("/:id", authenticate, updateFeedbackValidation, updateFeedback);
router.delete("/:id", authenticate, idValidation, deleteFeedback);
router.post("/:id/helpful", authenticate, idValidation, markHelpful);
router.post("/:id/flag", authenticate, idValidation, flagFeedback);

export default router;

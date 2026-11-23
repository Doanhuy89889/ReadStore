import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import {
  getBookReviews,
  getMyReviewStatus,
  upsertReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/book/:bookId", getBookReviews); // công khai
router.get("/book/:bookId/me", protectedRoute, getMyReviewStatus);
router.post("/book/:bookId", protectedRoute, upsertReview);
router.delete("/:id", protectedRoute, deleteReview);

export default router;
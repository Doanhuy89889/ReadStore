import express from "express";
import {
  getBookById,
  getBooks,
  getCategories,
  getNewBooks,
} from "../controllers/bookController.js";

const router = express.Router();

// lưu ý: các route cố định (/new, /categories) phải nằm TRƯỚC "/:id"
router.get("/new", getNewBooks);
router.get("/categories", getCategories);
router.get("/", getBooks);
router.get("/:id", getBookById);

export default router;
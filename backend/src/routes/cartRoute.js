import express from "express";
import {
  addToCart,
  getCartItems,
  removeCartItems,
  updateCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", getCartItems);
router.post("/items", addToCart);
router.patch("/items/:bookId", updateCartItem);
router.post("/remove", removeCartItems);

export default router;

import express from "express";
import { createOrder, getOrder, switchToCod } from "../controllers/orderController.js";
import { cancelMyOrder, listMyOrders } from "../controllers/orderHistoryController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", listMyOrders); // phải đặt TRƯỚC "/:id"
router.get("/:id", getOrder);
router.post("/:id/switch-cod", switchToCod);
router.post("/:id/cancel", cancelMyOrder);

export default router;

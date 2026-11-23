import express from "express";
import { sendContactMessage } from "../controllers/contactController.js";

const router = express.Router();

// giới hạn chống spam: mỗi IP tối đa 5 tin / 15 phút (lưu trong bộ nhớ server)
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map(); // ip -> { count, resetAt }

const contactLimiter = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip;
  let entry = hits.get(ip);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    hits.set(ip, entry);
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({ message: "Bạn gửi quá nhiều tin nhắn, vui lòng thử lại sau ít phút" });
  }

  // dọn bớt các bản ghi đã hết hạn
  if (hits.size > 1000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  next();
};

router.post("/", contactLimiter, sendContactMessage);

export default router;

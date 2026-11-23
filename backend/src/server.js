import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import bookRoute from "./routes/bookRoute.js";
import cartRoute from "./routes/cartRoute.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import contactRoute from "./routes/contactRoute.js";
import cors from "cors";
import orderRoute from "./routes/orderRoute.js";
import webhookRoute from "./routes/webhookRoute.js";
import { expireUnpaidOrders } from "./services/orderService.js";
import reviewRoute from "./routes/reviewRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const isProd = process.env.NODE_ENV === "production";

if (isProd) app.set("trust proxy", 1);

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// session (dùng cho giỏ hàng) - lưu trong MongoDB, collection "sessions_store"
app.use(
  session({
    name: "readstore.sid",
    secret: process.env.SESSION_SECRET || "dev-secret-doi-trong-env",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_CONNECTIONSTRING,
      collectionName: "sessions_store",
      ttl: 7 * 24 * 60 * 60, // 7 ngày
    }),
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
    },
  })
);

// public routes
app.use("/api/auth", authRoute);
app.use("/api/books", bookRoute);
app.use("/api/contact", contactRoute);
app.use("/api/webhooks", webhookRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/books", bookRoute);
// private routes
app.use(protectedRoute);
app.use("/api/users", userRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`server bắt đầu trên cổng ${PORT}`));
  setInterval(() => expireUnpaidOrders().catch(console.error), 60 * 1000);
});
import crypto from "crypto";
import Sach from "../models/Sach.js";
import DonHang from "../models/Donhang.js";
import ChiTietDonHang from "../models/ChiTietDonHang.js";
import { generateId } from "../libs/generateId.js";
import { getCart, setCart } from "./cartController.js";
import {
  PAYMENT_HOLD_MINUTES,
  cancelUnpaidOrder,
  releaseStock,
  reserveStock,
} from "../services/orderService.js";
import { getBookImage } from "../libs/bookImages.js";

const PHONE_REGEX = /^(0|\+84)\d{9}$/;
const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// đọc lúc chạy (dotenv.config() được gọi sau các import)
const getPrefix = () => (process.env.SEPAY_PAYMENT_PREFIX || "RS").toUpperCase();

// mã thanh toán dạng RS + 10 ký tự (khớp regex trong webhookController), không trùng đơn nào
const generatePaymentCode = async () => {
  for (let i = 0; i < 5; i++) {
    const bytes = crypto.randomBytes(10);
    const code = getPrefix() + Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("");
    if (!(await DonHang.exists({ MaThanhToan: code }))) return code;
  }
  throw new Error("Không tạo được mã thanh toán");
};

const buildPaymentInfo = (order) => {
  const base = process.env.SEPAY_QR_BASE || "https://qr.sepay.vn/img";
  const bank = process.env.SEPAY_BANK || "";
  const acc = process.env.SEPAY_ACCOUNT_NUMBER || "";

  return {
    bank,
    accountNumber: acc,
    accountName: process.env.SEPAY_ACCOUNT_NAME || "",
    content: order.MaThanhToan,
    amount: order.TongTien,
    qrUrl: `${base}?${new URLSearchParams({
      acc,
      bank,
      amount: String(order.TongTien),
      des: order.MaThanhToan,
    })}`,
  };
};

// dạng dữ liệu trả về frontend (xem types/order.ts)
const toOrderResponse = async (order) => {
  const lines = await ChiTietDonHang.find({ MaDH: order._id }).lean();
  const books = await Sach.find({ _id: { $in: lines.map((l) => l.MaSach) } }).lean();
  const bookMap = new Map(books.map((b) => [b._id, b]));

  const waitingPayment = order.TrangThai === "Chờ thanh toán" && order.PhuongThucThanhToan === "SEPAY";

  return {
    _id: order._id,
    status: order.TrangThai,
    paymentStatus: order.TrangThaiThanhToan,
    paymentMethod: order.PhuongThucThanhToan,
    address: order.DiaChiGiaoHang,
    phone: order.SDTNhan,
    total: order.TongTien,
    createdAt: order.NgayDat,
    expiresAt: order.HetHanThanhToan,
    cancelReason: order.LyDoHuy,
    items: lines.map((l) => {
      const b = bookMap.get(l.MaSach);
      return {
        bookId: l.MaSach,
        title: b?.TenSach ?? l.MaSach,
        image: getBookImage(b),
        quantity: l.SoLuong,
        price: l.DonGia,
        lineTotal: l.DonGia * l.SoLuong,
      };
    }),
    payment: waitingPayment ? buildPaymentInfo(order) : undefined,
  };
};

// POST /api/orders   body: { address, phone, paymentMethod, bookIds }   (UC-14)
export const createOrder = async (req, res) => {
  let reserved = [];
  try {
    const { address, phone, paymentMethod, bookIds } = req.body;

    if (!address?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập địa chỉ và số điện thoại nhận hàng" });
    }
    if (!PHONE_REGEX.test(phone.trim())) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }
    if (!["COD", "SEPAY"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
    }

    // sách được chọn từ giỏ hàng (session)
    const cart = getCart(req);
    const selected =
      Array.isArray(bookIds) && bookIds.length ? cart.filter((i) => bookIds.includes(i.bookId)) : cart;
    if (selected.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống hoặc chưa chọn sách để đặt" });
    }

    // kiểm tra từng sách còn tồn tại và đủ hàng (UC-14 6a)
    const books = await Sach.find({ _id: { $in: selected.map((i) => i.bookId) } }).lean();
    const bookMap = new Map(books.map((b) => [b._id, b]));

    const problems = [];
    for (const it of selected) {
      const b = bookMap.get(it.bookId);
      if (!b) problems.push(`Sách ${it.bookId} không còn tồn tại`);
      else if (b.SoLuongTon < it.quantity) {
        problems.push(b.SoLuongTon <= 0 ? `“${b.TenSach}” đã hết hàng` : `“${b.TenSach}” chỉ còn ${b.SoLuongTon} cuốn`);
      }
    }
    if (problems.length) return res.status(400).json({ message: problems.join("; ") });

    // trừ (giữ) tồn kho
    reserved = selected.map((i) => ({ bookId: i.bookId, quantity: i.quantity }));
    try {
      await reserveStock(reserved);
    } catch (err) {
      reserved = [];
      if (err.message === "OUT_OF_STOCK") {
        const b = bookMap.get(err.bookId);
        return res.status(400).json({ message: `“${b?.TenSach ?? err.bookId}” vừa hết hàng, vui lòng kiểm tra lại giỏ hàng` });
      }
      throw err;
    }

    // tạo đơn: chốt đơn giá tại thời điểm đặt
    const total = selected.reduce((s, i) => s + bookMap.get(i.bookId).GiaBan * i.quantity, 0);
    const isOnline = paymentMethod === "SEPAY";
    const orderId = await generateId(DonHang, "DH");

    const order = await DonHang.create({
      _id: orderId,
      UserId: String(req.user._id),
      DiaChiGiaoHang: address.trim(),
      SDTNhan: phone.trim(),
      TongTien: total,
      PhuongThucThanhToan: paymentMethod,
      TrangThaiThanhToan: "Chưa thanh toán",
      TrangThai: isOnline ? "Chờ thanh toán" : "Chờ duyệt",
      MaThanhToan: isOnline ? await generatePaymentCode() : undefined,
      HetHanThanhToan: isOnline ? new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60 * 1000) : undefined,
    });

    await ChiTietDonHang.insertMany(
      selected.map((i) => ({
        MaDH: orderId,
        MaSach: i.bookId,
        SoLuong: i.quantity,
        DonGia: bookMap.get(i.bookId).GiaBan,
      }))
    );

    // xoá các sách đã đặt khỏi giỏ hàng
    const ordered = new Set(selected.map((i) => i.bookId));
    setCart(req, cart.filter((i) => !ordered.has(i.bookId)));

    return res.status(201).json({ order: await toOrderResponse(order) });
  } catch (error) {
    // lỗi bất ngờ: hoàn lại tồn kho đã giữ để không bị "mất" hàng
    if (reserved.length) await releaseStock(reserved).catch(() => {});
    console.error("Lỗi khi gọi createOrder", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/orders/:id   (chỉ chủ đơn xem được)
export const getOrder = async (req, res) => {
  try {
    let order = await DonHang.findOne({ _id: req.params.id, UserId: String(req.user._id) });
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // quá hạn giữ hàng mà job quét chưa kịp chạy -> huỷ ngay
    if (order.TrangThai === "Chờ thanh toán" && order.HetHanThanhToan && order.HetHanThanhToan <= new Date()) {
      await cancelUnpaidOrder(order._id, "Hết thời gian thanh toán");
      order = await DonHang.findById(order._id);
    }

    return res.status(200).json({ order: await toOrderResponse(order) });
  } catch (error) {
    console.error("Lỗi khi gọi getOrder", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /api/orders/:id/switch-cod   (UC-17 4a: đổi sang COD khi chưa trả tiền, còn trong thời gian giữ hàng)
export const switchToCod = async (req, res) => {
  try {
    const order = await DonHang.findOneAndUpdate(
      {
        _id: req.params.id,
        UserId: String(req.user._id),
        TrangThai: "Chờ thanh toán",
        PhuongThucThanhToan: "SEPAY",
        HetHanThanhToan: { $gt: new Date() },
      },
      {
        $set: { PhuongThucThanhToan: "COD", TrangThai: "Chờ duyệt", TrangThaiThanhToan: "Chưa thanh toán" },
        $unset: { HetHanThanhToan: 1 },
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({ message: "Đơn không còn ở trạng thái chờ thanh toán hoặc đã hết hạn" });
    }

    return res.status(200).json({ order: await toOrderResponse(order) });
  } catch (error) {
    console.error("Lỗi khi gọi switchToCod", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

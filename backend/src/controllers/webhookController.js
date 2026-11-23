import crypto from "crypto";
import DonHang from "../models/Donhang.js";
import SepayTransaction from "../models/SepayTransaction.js";
const getPrefix = () => (process.env.SEPAY_PAYMENT_PREFIX || "RS").toUpperCase();
const safeEqual = (a, b) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};
const extractCode = (data) => {
  if (data.code) return String(data.code).toUpperCase();
  const m = String(data.content || "").toUpperCase().match(new RegExp(`${getPrefix()}[A-Z0-9]{10}`));
  return m ? m[0] : null;
};
export const sepayWebhook = async (req, res) => {
  try {
    const key = process.env.SEPAY_API_KEY;
    const auth = String(req.headers.authorization || "");
    if (!key || !safeEqual(auth, `Apikey ${key}`)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = req.body || {};
    if (data.transferType !== "in" || data.id === undefined) {
      return res.status(200).json({ success: true });
    }
    try {
      await SepayTransaction.create({ _id: String(data.id), body: data });
    } catch (e) {
      if (e.code === 11000) return res.status(200).json({ success: true });
      throw e;
    }

    const code = extractCode(data);
    const amount = Number(data.transferAmount) || 0;
    if (!code) return res.status(200).json({ success: true });
    const order = await DonHang.findOneAndUpdate(
      {
        MaThanhToan: code,
        PhuongThucThanhToan: "SEPAY",
        TrangThai: "Chờ thanh toán",
        TongTien: { $lte: amount },
      },
      {
        $set: {
          TrangThai: "Chờ duyệt",
          TrangThaiThanhToan: "Đã thanh toán",
          NgayThanhToan: new Date(),
          MaGiaoDichSePay: String(data.id),
        },
      },
      { new: true }
    );

    if (order) {
      await SepayTransaction.updateOne({ _id: String(data.id) }, { $set: { orderId: order._id } });
    } else {
      const note = `Không khớp đơn đang chờ thanh toán (mã ${code}, ${amount}đ)`;
      console.warn("[SePay]", note);
      await SepayTransaction.updateOne({ _id: String(data.id) }, { $set: { note } });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Lỗi webhook SePay", error);
    return res.status(500).json({ success: false });
  }
};

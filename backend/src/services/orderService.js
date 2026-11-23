import Sach from "../models/Sach.js";
import DonHang from "../models/Donhang.js";
import ChiTietDonHang from "../models/ChiTietDonHang.js";

// đơn SePay giữ hàng tối đa 15 phút
export const PAYMENT_HOLD_MINUTES = 15;

/**
 * Trừ (giữ) tồn kho cho danh sách [{ bookId, quantity }].
 * Mỗi sách trừ nguyên tử (chỉ khi đủ hàng). Nếu một sách thất bại -> hoàn lại
 * các sách đã trừ trước đó rồi ném Error("OUT_OF_STOCK") kèm err.bookId.
 */
export const reserveStock = async (items) => {
  const done = [];
  for (const { bookId, quantity } of items) {
    const result = await Sach.updateOne(
      { _id: bookId, SoLuongTon: { $gte: quantity } },
      { $inc: { SoLuongTon: -quantity } }
    );
    if (result.modifiedCount === 0) {
      await releaseStock(done).catch(() => {});
      const err = new Error("OUT_OF_STOCK");
      err.bookId = bookId;
      throw err;
    }
    done.push({ bookId, quantity });
  }
};

/** Hoàn lại tồn kho cho danh sách [{ bookId, quantity }]. */
export const releaseStock = async (items) => {
  if (!items?.length) return;
  await Sach.bulkWrite(
    items.map(({ bookId, quantity }) => ({
      updateOne: { filter: { _id: bookId }, update: { $inc: { SoLuongTon: quantity } } },
    }))
  );
};

/**
 * Huỷ đơn SePay chưa thanh toán (quá hạn / người dùng huỷ) và trả hàng về kho.
 * Chỉ huỷ khi đơn vẫn đang "Chờ thanh toán" -> an toàn khi gọi nhiều lần
 * (không hoàn kho 2 lần). Trả về đơn đã huỷ, hoặc null nếu không có gì để huỷ.
 */
export const cancelUnpaidOrder = async (orderId, reason = "Hết thời gian thanh toán") => {
  const order = await DonHang.findOneAndUpdate(
    { _id: orderId, TrangThai: "Chờ thanh toán", TrangThaiThanhToan: "Chưa thanh toán" },
    { $set: { TrangThai: "Đã huỷ", NgayHuy: new Date(), LyDoHuy: reason } },
    { new: true }
  );
  if (!order) return null;

  const lines = await ChiTietDonHang.find({ MaDH: orderId }).lean();
  await releaseStock(lines.map((l) => ({ bookId: l.MaSach, quantity: l.SoLuong })));
  return order;
};

/** Quét các đơn SePay quá hạn giữ hàng và huỷ (dùng cho job định kỳ). */
export const expireUnpaidOrders = async () => {
  const expired = await DonHang.find({
    TrangThai: "Chờ thanh toán",
    PhuongThucThanhToan: "SEPAY",
    HetHanThanhToan: { $lte: new Date() },
  })
    .select("_id")
    .lean();

  let count = 0;
  for (const o of expired) {
    if (await cancelUnpaidOrder(o._id, "Hết thời gian thanh toán")) count++;
  }
  return count;
};

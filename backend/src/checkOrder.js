import "dotenv/config";
import mongoose from "mongoose";

// Kiểm tra TỪNG BƯỚC của luồng đặt hàng, bỏ qua web/session để biết lỗi nằm ở đâu.
// Chạy: npm run check-order      (đơn thử sẽ được xoá và tồn kho hoàn lại sau khi kiểm tra)
let failed = false;
const ok = (m) => console.log("✔", m);
const fail = (m, e) => {
  failed = true;
  console.log("✘", m);
  if (e) console.log("   ", e?.message ?? e);
};

// 1) thư viện + file có đủ không (thiếu file/export sẽ báo ngay tại đây)
for (const pkg of ["express-session", "connect-mongo", "bcrypt"]) {
  try {
    await import(pkg);
    ok(`thư viện ${pkg}`);
  } catch (e) {
    fail(`thiếu thư viện ${pkg} -> chạy: npm install`, e);
  }
}
for (const f of [
  "./libs/generateId.js",
  "./services/orderService.js",
  "./controllers/cartController.js",
  "./controllers/orderController.js",
  "./controllers/orderHistoryController.js",
  "./controllers/webhookController.js",
  "./routes/orderRoute.js",
  "./routes/webhookRoute.js",
]) {
  try {
    await import(f);
    ok(`file ${f}`);
  } catch (e) {
    fail(`file ${f} bị lỗi hoặc thiếu`, e);
  }
}
if (failed) {
  console.log("\n=> Sửa các mục ✘ ở trên trước (backend sẽ không khởi động được).");
  process.exit(1);
}

// 2) thử tạo đơn thật trong database rồi xoá
const { generateId } = await import("./libs/generateId.js");
const { reserveStock, releaseStock } = await import("./services/orderService.js");
const { default: Sach } = await import("./models/Sach.js");
const { default: DonHang } = await import("./models/Donhang.js");
const { default: ChiTietDonHang } = await import("./models/ChiTietDonHang.js");

await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
console.log("\nDatabase đang dùng:", mongoose.connection.name);

let reserved = null;
let orderId = null;
try {
  const book = await Sach.findOne({ SoLuongTon: { $gt: 0 } }).lean();
  if (!book) throw new Error("Không có sách nào còn tồn kho (SoLuongTon > 0)");
  ok(`đọc sách: ${book._id} - ${book.TenSach} (tồn ${book.SoLuongTon})`);

  reserved = [{ bookId: book._id, quantity: 1 }];
  await reserveStock(reserved);
  ok("trừ tồn kho (reserveStock)");

  orderId = await generateId(DonHang, "DH");
  ok(`sinh mã đơn: ${orderId}`);

  await DonHang.create({
    _id: orderId,
    UserId: "KIEM_TRA",
    DiaChiGiaoHang: "địa chỉ thử",
    SDTNhan: "0900000000",
    TongTien: book.GiaBan,
    PhuongThucThanhToan: "COD",
    TrangThai: "Chờ duyệt",
  });
  ok("tạo đơn (DonHang.create)");

  await ChiTietDonHang.insertMany([{ MaDH: orderId, MaSach: book._id, SoLuong: 1, DonGia: book.GiaBan }]);
  ok("tạo chi tiết đơn (ChiTietDonHang.insertMany)");
} catch (e) {
  fail("lỗi trong lúc tạo đơn thử", e);
  console.log(e);
} finally {
  // dọn dẹp: xoá đơn thử, hoàn tồn kho, trả lại số thứ tự
  if (orderId) {
    await ChiTietDonHang.deleteMany({ MaDH: orderId }).catch(() => {});
    await DonHang.deleteOne({ _id: orderId }).catch(() => {});
    await mongoose.connection.collection("counters").updateOne({ _id: "DH" }, { $inc: { seq: -1 } }).catch(() => {});
  }
  if (reserved) await releaseStock(reserved).catch(() => {});
  await mongoose.disconnect();
}

console.log(
  failed
    ? "\n=> Có lỗi ở bước tạo đơn: gửi mình nguyên đoạn ✘ ở trên."
    : "\n=> Phần database/đặt hàng HOẠT ĐỘNG TỐT. Nếu web vẫn không đặt được, lỗi nằm ở backend đang chạy (chưa khởi động lại) hoặc phiên giỏ hàng."
);

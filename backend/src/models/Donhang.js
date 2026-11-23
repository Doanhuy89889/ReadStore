import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    _id: String,
    UserId: { type: String, ref: "User", required: true },
    MaNV: { type: String, ref: "NhanVien" }, // nhân viên duyệt đơn (gán khi duyệt)
    NgayDat: { type: Date, default: Date.now },
    DiaChiGiaoHang: String,
    SDTNhan: String,
    // Chờ thanh toán -> Chờ duyệt -> Đang xử lý -> Đang giao -> Hoàn thành | Đã huỷ
    TrangThai: { type: String, default: "Chờ duyệt" },
    TongTien: { type: Number, required: true },

    PhuongThucThanhToan: { type: String, enum: ["COD", "SEPAY"], default: "COD" },
    TrangThaiThanhToan: { type: String, default: "Chưa thanh toán" }, // Chưa thanh toán | Đã thanh toán | Đã hoàn tiền
    MaThanhToan: { type: String, index: true, sparse: true }, // mã đưa vào nội dung chuyển khoản (vd RSAB12CD34EF)
    HetHanThanhToan: Date, // đơn SePay: giữ hàng tối đa 15 phút
    NgayThanhToan: Date,
    MaGiaoDichSePay: String,
    NgayHuy: Date,
    CanHoanTienThuCong: Boolean, // đơn đã chuyển khoản mà bị huỷ: cần hoàn tiền thủ công
    LyDoHuy: String,
  },
  { versionKey: false }
);
export default mongoose.model("Donhang", schema, "DonHang");

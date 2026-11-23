import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    MaDH: { type: String, ref: "Donhang", required: true },
    MaSach: { type: String, ref: "Sach", required: true },
    SoLuong: { type: Number, required: true },
    DonGia: { type: Number, required: true },
  },
  { versionKey: false }
);
export default mongoose.model("ChiTietDonHang", schema, "ChiTietDonHang");

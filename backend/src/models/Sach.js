import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    _id: String,
    TenSach: { type: String, required: true },
    TacGia: String,
    MaNXB: { type: String, ref: "NhaXuatBan" },
    NamXuatBan: Number,
    GiaBan: { type: Number, required: true },
    SoLuongTon: { type: Number, default: 0 },
    MoTa: String,
    HinhAnh: String,
    ISBN: String,
  },
  { versionKey: false }
);
export default mongoose.model("Sach", schema, "Sach");

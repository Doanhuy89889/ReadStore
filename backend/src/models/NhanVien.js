import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    _id: String,
    HoTen: { type: String, required: true },
    GioiTinh: String,
    NgaySinh: Date,
    DiaChi: String,
    SDT: String,
    Email: String,
    ChucVu: String,
    NgayVaoLam: Date,
    Luong: Number,
    TenDangNhap: { type: String, unique: true, sparse: true },
    MatKhau: String,
  },
  { versionKey: false }
);
export default mongoose.model("NhanVien", schema, "NhanVien");

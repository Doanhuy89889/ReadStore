import mongoose from "mongoose";

const schema = new mongoose.Schema(
  { MaSach: { type: String, ref: "Sach", required: true }, MaTheLoai: { type: String, ref: "TheLoai", required: true } },
  { versionKey: false }
);
export default mongoose.model("SachTheLoai", schema, "SachTheLoai");

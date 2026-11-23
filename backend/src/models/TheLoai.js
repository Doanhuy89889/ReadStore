import mongoose from "mongoose";

const schema = new mongoose.Schema(
  { _id: String, TenTheLoai: { type: String, required: true }, SoLuongSach: { type: Number, default: 0 } },
  { versionKey: false }
);
export default mongoose.model("TheLoai", schema, "TheLoai");

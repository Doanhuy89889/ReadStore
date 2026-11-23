import mongoose from "mongoose";

const schema = new mongoose.Schema(
  { _id: String, TenNXB: { type: String, required: true }, DiaChi: String },
  { versionKey: false }
);
export default mongoose.model("NhaXuatBan", schema, "NhaXuatBan");

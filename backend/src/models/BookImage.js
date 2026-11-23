import mongoose from "mongoose";

const schema = new mongoose.Schema(
  { _id: String, MaSach: { type: String, ref: "Sach", required: true }, TenAnh: String, LaAnhChinh: { type: Number, default: 0 } },
  { versionKey: false }
);
export default mongoose.model("BookImage", schema, "BookImage");

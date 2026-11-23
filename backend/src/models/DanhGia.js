import mongoose from "mongoose";
import { generateId } from "../libs/generateId.js";

const schema = new mongoose.Schema(
  {
    _id: String,
    MaSach: { type: String, ref: "Sach", required: true, index: true },
    UserId: { type: String, ref: "User", required: true },
    SoSao: { type: Number, required: true, min: 1, max: 5 },
    NoiDung: { type: String, trim: true, maxlength: 1000 },
  },
  { versionKey: false, timestamps: { createdAt: "NgayDanhGia", updatedAt: "NgayCapNhat" } }
);

// mỗi user chỉ đánh giá 1 lần / 1 sách
schema.index({ MaSach: 1, UserId: 1 }, { unique: true });

schema.pre("validate", async function (next) {
  if (!this._id) this._id = await generateId(this.constructor, "DG");
  next();
});

export default mongoose.model("DanhGia", schema, "DanhGia");
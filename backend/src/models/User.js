import mongoose from "mongoose";
import { generateId } from "../libs/generateId.js";

// Khớp với collection "User" đã có sẵn trên MongoDB (tên field viết hoa chữ đầu)
const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    Username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    HashedPassword: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    DisplayName: {
      type: String,
      required: true,
      trim: true,
    },
    GioiTinh: { type: String },
    NgaySinh: { type: Date },
    SDT: {
      type: String,
      sparse: true,
    },
    DiaChi: { type: String },
    AvatarUrl: {
      type: String, // link CDN để hiển thị hình
    },
    AvatarId: {
      type: String, // Cloudinary public_id để xoá hình
    },
    Bio: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: { createdAt: "CreatedAt", updatedAt: "UpdatedAt" },
    versionKey: false,
    // trả về frontend theo đúng dạng cũ (username, displayName...) để không phải sửa frontend
    toJSON: {
      transform: (_doc, ret) => ({
        _id: ret._id,
        username: ret.Username,
        email: ret.Email,
        displayName: ret.DisplayName,
        gender: ret.GioiTinh,
        dateOfBirth: ret.NgaySinh,
        phone: ret.SDT,
        address: ret.DiaChi,
        avatarUrl: ret.AvatarUrl,
        bio: ret.Bio,
        createdAt: ret.CreatedAt,
        updatedAt: ret.UpdatedAt,
      }),
    },
  }
);

// tự sinh _id dạng U001, U002...
userSchema.pre("validate", async function (next) {
  if (!this._id) {
    this._id = await generateId(this.constructor, "U");
  }
  next();
});

const User = mongoose.model("User", userSchema, "User");
export default User;

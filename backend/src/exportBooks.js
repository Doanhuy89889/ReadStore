import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import Sach from "./models/Sach.js";
import TheLoai from "./models/TheLoai.js";
import SachTheLoai from "./models/SachTheLoai.js";
import NhaXuatBan from "./models/NhaXuatBan.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);

const [books, cats, links, nxbs] = await Promise.all([
  Sach.find().lean(),
  TheLoai.find().lean(),
  SachTheLoai.find().lean(),
  NhaXuatBan.find().lean(),
]);
const catName = new Map(cats.map((c) => [c._id, c.TenTheLoai]));
const nxbName = new Map(nxbs.map((n) => [n._id, n.TenNXB]));

const text = books
  .map((b) => {
    const cs = links
      .filter((l) => l.MaSach === b._id)
      .map((l) => catName.get(l.MaTheLoai))
      .filter(Boolean)
      .join(", ");
    return [
      `Sách: ${b.TenSach}`,
      `Tác giả: ${b.TacGia ?? "không rõ"}`,
      `Thể loại: ${cs || "không rõ"}`,
      `Nhà xuất bản: ${nxbName.get(b.MaNXB) ?? "không rõ"}`,
      `Năm xuất bản: ${b.NamXuatBan ?? "không rõ"}`,
      `Giá: ${b.GiaBan?.toLocaleString("vi-VN")}đ`,
      `Mô tả: ${b.MoTa ?? ""}`,
    ].join("\n");
  })
  .join("\n\n---\n\n");

fs.writeFileSync("books.txt", text);
console.log(`Đã xuất ${books.length} sách ra books.txt`);
await mongoose.disconnect();

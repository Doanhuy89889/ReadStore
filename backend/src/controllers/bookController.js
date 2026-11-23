import Sach from "../models/Sach.js";
import TheLoai from "../models/TheLoai.js";
import SachTheLoai from "../models/SachTheLoai.js";
import NhaXuatBan from "../models/NhaXuatBan.js";
import { getBookImage } from "../libs/bookImages.js";

// map field tiếng Việt trong DB -> dạng frontend dùng
const toBook = (s) => ({
  _id: s._id,
  title: s.TenSach,
  author: s.TacGia,
  price: s.GiaBan,
  stock: s.SoLuongTon,
  image: getBookImage(s),
  year: s.NamXuatBan,
});

// thoát ký tự đặc biệt để dùng như LIKE '%...%' (không bị hiểu thành regex)
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNumber = (v) =>
  v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Number(v);

const SORTS = {
  new: { NamXuatBan: -1, _id: -1 },
  price_asc: { GiaBan: 1, _id: 1 },
  price_desc: { GiaBan: -1, _id: -1 },
  name: { TenSach: 1, _id: 1 },
};

// sách mới nhất: ưu tiên năm xuất bản mới, sau đó mã sách mới
export const getNewBooks = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 8, 24);

    const books = await Sach.find()
      .sort({ NamXuatBan: -1, _id: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ books: books.map(toBook) });
  } catch (error) {
    console.error("Lỗi khi gọi getNewBooks", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// danh sách thể loại cho sidebar
export const getCategories = async (req, res) => {
  try {
    const list = await TheLoai.find().sort({ TenTheLoai: 1 }).lean();

    return res.status(200).json({
      categories: list.map((t) => ({
        _id: t._id,
        name: t.TenTheLoai,
        count: t.SoLuongSach ?? 0,
      })),
    });
  } catch (error) {
    console.error("Lỗi khi gọi getCategories", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/books?q=&categories=TL001,TL002&minPrice=&maxPrice=&sort=&page=&limit=
export const getBooks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 48);
    const q = String(req.query.q || "").trim();
    const categories = String(req.query.categories || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const minPrice = toNumber(req.query.minPrice);
    const maxPrice = toNumber(req.query.maxPrice);
    const sort = SORTS[req.query.sort] || SORTS.new;

    const and = [];

    // tìm kiếm kiểu LIKE '%q%' (không phân biệt hoa thường)
    // theo tên sách, tác giả, nhà xuất bản, thể loại
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");

      const [nxbs, theLoais] = await Promise.all([
        NhaXuatBan.find({ TenNXB: rx }).select("_id").lean(),
        TheLoai.find({ TenTheLoai: rx }).select("_id").lean(),
      ]);

      const idsByTheLoai = theLoais.length
        ? await SachTheLoai.distinct("MaSach", {
            MaTheLoai: { $in: theLoais.map((t) => t._id) },
          })
        : [];

      and.push({
        $or: [
          { TenSach: rx },
          { TacGia: rx },
          { MaNXB: { $in: nxbs.map((n) => n._id) } },
          { _id: { $in: idsByTheLoai } },
        ],
      });
    }

    // lọc theo thể loại (chọn nhiều thể loại = lấy sách thuộc bất kỳ thể loại nào)
    if (categories.length) {
      const ids = await SachTheLoai.distinct("MaSach", {
        MaTheLoai: { $in: categories },
      });
      and.push({ _id: { $in: ids } });
    }

    // lọc theo khoảng giá
    if (minPrice !== null || maxPrice !== null) {
      const price = {};
      if (minPrice !== null) price.$gte = minPrice;
      if (maxPrice !== null) price.$lte = maxPrice;
      and.push({ GiaBan: price });
    }

    const filter = and.length ? { $and: and } : {};

    const [total, books] = await Promise.all([
      Sach.countDocuments(filter),
      Sach.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      books: books.map(toBook),
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("Lỗi khi gọi getBooks", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/books/:id  -> chi tiết sách + sách liên quan (cùng thể loại)  (UC-10)
export const getBookById = async (req, res) => {
  try {
    const book = await Sach.findById(req.params.id).lean();

    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    const [nxb, links] = await Promise.all([
      book.MaNXB ? NhaXuatBan.findById(book.MaNXB).lean() : null,
      SachTheLoai.find({ MaSach: book._id }).lean(),
    ]);

    const categoryIds = links.map((l) => l.MaTheLoai);

    const [categories, relatedIds] = await Promise.all([
      TheLoai.find({ _id: { $in: categoryIds } }).lean(),
      categoryIds.length
        ? SachTheLoai.distinct("MaSach", { MaTheLoai: { $in: categoryIds } })
        : [],
    ]);

    const related = await Sach.find({
      _id: { $in: relatedIds.filter((id) => id !== book._id) },
    })
      .sort({ NamXuatBan: -1, _id: -1 })
      .limit(4)
      .lean();

    return res.status(200).json({
      book: {
        ...toBook(book),
        description: book.MoTa,
        isbn: book.ISBN,
        publisher: nxb?.TenNXB,
        categories: categories.map((t) => ({ _id: t._id, name: t.TenTheLoai })),
      },
      related: related.map(toBook),
    });
  } catch (error) {
    console.error("Lỗi khi gọi getBookById", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
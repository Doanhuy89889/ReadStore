import Sach from "../models/Sach.js";
import { getBookImage } from "../libs/bookImages.js";

export const getCart = (req) => {
  const uid = String(req.user._id);
  req.session.carts ??= {};
  req.session.carts[uid] ??= [];
  return req.session.carts[uid];
};

export const setCart = (req, cart) => {
  req.session.carts[String(req.user._id)] = cart;
};
// dựng dữ liệu giỏ hàng từ session + thông tin sách mới nhất trong DB
const buildCartResponse = async (req) => {
  const cart = getCart(req);
  const books = await Sach.find({ _id: { $in: cart.map((i) => i.bookId) } }).lean();
  const bookMap = new Map(books.map((b) => [b._id, b]));

  // bỏ sách không còn tồn tại khỏi giỏ
  const validCart = cart.filter((i) => bookMap.has(i.bookId));
  if (validCart.length !== cart.length) setCart(req, validCart);

  const items = validCart.map((i) => {
    const b = bookMap.get(i.bookId);
    return {
      bookId: b._id,
      title: b.TenSach,
      author: b.TacGia,
      image: getBookImage(b),
      price: b.GiaBan,
      stock: b.SoLuongTon,
      quantity: i.quantity,
      lineTotal: b.GiaBan * i.quantity,
    };
  });

  return {
    items,
    subtotal: items.reduce((s, i) => s + i.lineTotal, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };
};

const parseQuantity = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 ? n : null;
};

// GET /api/cart
export const getCartItems = async (req, res) => {
  try {
    return res.status(200).json(await buildCartResponse(req));
  } catch (error) {
    console.error("Lỗi khi gọi getCartItems", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /api/cart/items  { bookId, quantity }  (UC-11)
export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const qty = parseQuantity(quantity);

    if (!bookId || qty === null) {
      return res.status(400).json({ message: "Mã sách hoặc số lượng không hợp lệ" });
    }

    const book = await Sach.findById(bookId).lean();
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    if (book.SoLuongTon <= 0) {
      return res.status(400).json({ message: "Sách đã hết hàng" });
    }

    const cart = getCart(req);
    const existing = cart.find((i) => i.bookId === bookId);
    const newQty = (existing?.quantity || 0) + qty; // đã có thì cộng dồn

    if (newQty > book.SoLuongTon) {
      return res.status(400).json({
        message: `Chỉ còn ${book.SoLuongTon} cuốn trong kho (trong giỏ đã có ${existing?.quantity || 0})`,
      });
    }

    if (existing) existing.quantity = newQty;
    else cart.push({ bookId, quantity: newQty });
    setCart(req, cart);

    return res.status(200).json(await buildCartResponse(req));
  } catch (error) {
    console.error("Lỗi khi gọi addToCart", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// PATCH /api/cart/items/:bookId  { quantity }  (UC-12 tăng/giảm số lượng)
export const updateCartItem = async (req, res) => {
  try {
    const { bookId } = req.params;
    const qty = parseQuantity(req.body.quantity);

    if (qty === null) {
      return res.status(400).json({ message: "Số lượng không hợp lệ" });
    }

    const cart = getCart(req);
    const item = cart.find((i) => i.bookId === bookId);
    if (!item) return res.status(404).json({ message: "Sách không có trong giỏ hàng" });

    const book = await Sach.findById(bookId).lean();
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });

    if (qty > book.SoLuongTon) {
      return res.status(400).json({ message: `Chỉ còn ${book.SoLuongTon} cuốn trong kho` });
    }

    item.quantity = qty;
    setCart(req, cart);

    return res.status(200).json(await buildCartResponse(req));
  } catch (error) {
    console.error("Lỗi khi gọi updateCartItem", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /api/cart/remove  { bookIds: [...] }  (UC-12 xoá một hoặc nhiều sách)
export const removeCartItems = async (req, res) => {
  try {
    const { bookIds } = req.body;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: "Chưa chọn sách cần xoá" });
    }

    setCart(
      req,
      getCart(req).filter((i) => !bookIds.includes(i.bookId))
    );

    return res.status(200).json(await buildCartResponse(req));
  } catch (error) {
    console.error("Lỗi khi gọi removeCartItems", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

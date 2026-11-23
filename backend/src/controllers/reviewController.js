import DanhGia from "../models/DanhGia.js";
import Donhang from "../models/Donhang.js";
import ChiTietDonHang from "../models/ChiTietDonHang.js";
import Sach from "../models/Sach.js";

// đã mua = có đơn "Hoàn thành" chứa sách này
const hasPurchased = async (userId, bookId) => {
  const orderIds = await Donhang.distinct("_id", {
    UserId: userId,
    TrangThai: "Hoàn thành",
  });
  if (!orderIds.length) return false;
  return !!(await ChiTietDonHang.exists({ MaDH: { $in: orderIds }, MaSach: bookId }));
};

const toReview = (r) => ({
  _id: r._id,
  userId: r.UserId?._id ?? r.UserId,
  userName: r.UserId?.DisplayName ?? "Người dùng",
  avatarUrl: r.UserId?.AvatarUrl,
  rating: r.SoSao,
  content: r.NoiDung ?? "",
  createdAt: r.NgayDanhGia,
  updatedAt: r.NgayCapNhat,
});

// GET /api/reviews/book/:bookId?page=&limit=   (công khai)
export const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20);

    const [total, reviews, stats] = await Promise.all([
      DanhGia.countDocuments({ MaSach: bookId }),
      DanhGia.find({ MaSach: bookId })
        .sort({ NgayDanhGia: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("UserId", "DisplayName AvatarUrl")
        .lean(),
      DanhGia.aggregate([
        { $match: { MaSach: bookId } },
        { $group: { _id: "$SoSao", count: { $sum: 1 } } },
      ]),
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    stats.forEach((s) => {
      distribution[s._id] = s.count;
      sum += s._id * s.count;
    });

    return res.status(200).json({
      reviews: reviews.map(toReview),
      total,
      page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      average: total ? Math.round((sum / total) * 10) / 10 : 0,
      distribution,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getBookReviews", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// GET /api/reviews/book/:bookId/me   (cần đăng nhập) -> có được đánh giá không + đánh giá cũ của mình
export const getMyReviewStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;

    const [canReview, mine] = await Promise.all([
      hasPurchased(userId, bookId),
      DanhGia.findOne({ MaSach: bookId, UserId: userId }).lean(),
    ]);

    return res.status(200).json({
      canReview,
      myReview: mine ? { _id: mine._id, rating: mine.SoSao, content: mine.NoiDung ?? "" } : null,
    });
  } catch (error) {
    console.error("Lỗi khi gọi getMyReviewStatus", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// POST /api/reviews/book/:bookId   body: { rating, content }  (tạo mới hoặc cập nhật)
export const upsertReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user._id;
    const rating = Number(req.body.rating);
    const content = String(req.body.content ?? "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Số sao phải từ 1 đến 5" });
    }
    if (content.length > 1000) {
      return res.status(400).json({ message: "Nội dung tối đa 1000 ký tự" });
    }

    if (!(await Sach.exists({ _id: bookId }))) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    if (!(await hasPurchased(userId, bookId))) {
      return res
        .status(403)
        .json({ message: "Bạn chỉ có thể đánh giá sách đã mua và nhận hàng thành công" });
    }

    let review = await DanhGia.findOne({ MaSach: bookId, UserId: userId });
    if (review) {
      review.SoSao = rating;
      review.NoiDung = content;
      await review.save();
    } else {
      review = await DanhGia.create({ MaSach: bookId, UserId: userId, SoSao: rating, NoiDung: content });
    }

    return res.status(200).json({ message: "Đã gửi đánh giá", reviewId: review._id });
  } catch (error) {
    console.error("Lỗi khi gọi upsertReview", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// DELETE /api/reviews/:id   (chỉ xoá đánh giá của chính mình)
export const deleteReview = async (req, res) => {
  try {
    const review = await DanhGia.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    if (review.UserId !== String(req.user._id)) {
      return res.status(403).json({ message: "Bạn không có quyền xoá đánh giá này" });
    }
    await review.deleteOne();
    return res.status(200).json({ message: "Đã xoá đánh giá" });
  } catch (error) {
    console.error("Lỗi khi gọi deleteReview", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
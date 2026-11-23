import Sach from "../models/Sach.js";
import DonHang from "../models/Donhang.js";
import ChiTietDonHang from "../models/ChiTietDonHang.js";
import { releaseStock } from "../services/orderService.js";
import { getBookImage } from "../libs/bookImages.js";

const ALL_STATUS = ["Chờ thanh toán", "Chờ duyệt", "Đang xử lý", "Đang giao", "Hoàn thành", "Đã huỷ"];
const CANCELLABLE = ["Chờ thanh toán", "Chờ duyệt", "Đang xử lý"];
export const listMyOrders = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 30);

    const filter = { UserId: String(req.user._id) };
    if (ALL_STATUS.includes(req.query.status)) filter.TrangThai = req.query.status;

    const [total, orders] = await Promise.all([
      DonHang.countDocuments(filter),
      DonHang.find(filter)
        .sort({ NgayDat: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const lines = await ChiTietDonHang.find({ MaDH: { $in: orders.map((o) => o._id) } }).lean();
    const books = await Sach.find({ _id: { $in: [...new Set(lines.map((l) => l.MaSach))] } }).lean();
    const bookMap = new Map(books.map((b) => [b._id, b]));

    const result = orders.map((o) => {
      const items = lines.filter((l) => l.MaDH === o._id);
      return {
        _id: o._id,
        status: o.TrangThai,
        paymentStatus: o.TrangThaiThanhToan,
        paymentMethod: o.PhuongThucThanhToan,
        total: o.TongTien,
        createdAt: o.NgayDat,
        itemCount: items.reduce((s, l) => s + l.SoLuong, 0),
        preview: items.slice(0, 3).map((l) => ({
          title: bookMap.get(l.MaSach)?.TenSach ?? l.MaSach,
          image: getBookImage(bookMap.get(l.MaSach)),
          quantity: l.SoLuong,
        })),
        moreCount: Math.max(items.length - 3, 0),
      };
    });

    return res.status(200).json({
      orders: result,
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("Lỗi khi gọi listMyOrders", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
export const cancelMyOrder = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const order = await DonHang.findOne({ _id: req.params.id, UserId: userId }).lean();
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (!CANCELLABLE.includes(order.TrangThai)) {
      return res.status(400).json({ message: `Không thể huỷ đơn đang ở trạng thái "${order.TrangThai}"` });
    }
    const canceled = await DonHang.findOneAndUpdate(
      { _id: order._id, UserId: userId, TrangThai: { $in: CANCELLABLE } },
      {
        $set: { TrangThai: "Đã huỷ", LyDoHuy: "Khách hàng huỷ đơn", NgayHuy: new Date() },
        $unset: { HetHanThanhToan: 1 },
      },
      { new: true }
    );

    if (!canceled) {
      return res.status(409).json({ message: "Đơn hàng vừa được xử lý, vui lòng tải lại trang" });
    }
    const lines = await ChiTietDonHang.find({ MaDH: canceled._id }).lean();
    await releaseStock(lines.map((l) => ({ bookId: l.MaSach, quantity: l.SoLuong })));
    const needRefund = canceled.PhuongThucThanhToan === "SEPAY" && canceled.TrangThaiThanhToan === "Đã thanh toán";
    if (needRefund) {
      await DonHang.updateOne({ _id: canceled._id }, { $set: { CanHoanTienThuCong: true } });
    }

    return res.status(200).json({
      message: needRefund
        ? "Đã huỷ đơn. Cửa hàng sẽ liên hệ để hoàn lại tiền bạn đã chuyển khoản."
        : "Đã huỷ đơn hàng",
      needRefund,
    });
  } catch (error) {
    console.error("Lỗi khi gọi cancelMyOrder", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

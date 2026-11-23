// Ảnh bìa sách lấy từ cột HinhAnh trong database (admin nhập link ảnh).
// Trước đây file này có danh sách ảnh cục bộ cho 11 cuốn, nay bỏ để admin sửa ảnh là web khách đổi theo.
export const getBookImage = (book) => book?.HinhAnh || undefined;

// Style dùng chung cho toàn bộ giao diện. Màu chủ đạo lấy từ --primary trong app/globals.css
// (tên gradientBtn/gradientText/gradientBg giữ nguyên để không phải sửa chỗ dùng, nhưng giờ là màu phẳng)
export const gradientBtn =
  "border-0 bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md disabled:opacity-50 disabled:shadow-none";

export const gradientText = "text-primary";

export const gradientBg = "bg-primary";

export const chipActive = "border-transparent bg-primary text-primary-foreground shadow-sm";
export const chipIdle = "bg-background hover:border-primary/40 hover:bg-primary/10";

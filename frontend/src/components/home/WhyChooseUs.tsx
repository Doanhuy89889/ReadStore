import { CreditCard, MessageSquareText, PackageSearch, Sparkles, TicketPercent, ShieldCheck } from "lucide-react";

const REASONS = [
  { icon: CreditCard, title: "Thanh toán linh hoạt", desc: "Thanh toán khi nhận hàng (COD) hoặc trực tuyến qua cổng thanh toán." },
  { icon: PackageSearch, title: "Theo dõi đơn hàng", desc: "Xem trạng thái đơn từ lúc chờ duyệt, đang giao đến khi hoàn thành." },
  { icon: TicketPercent, title: "Mã giảm giá thường xuyên", desc: "Nhập mã khi đặt hàng để mua sách với giá tốt hơn." },
  { icon: MessageSquareText, title: "Đánh giá từ người mua thật", desc: "Chỉ khách đã mua sách mới được đánh giá, dễ chọn sách đáng tin." },
  { icon: Sparkles, title: "Gợi ý đúng gu của bạn", desc: "Sách đề xuất theo lịch sử mua hàng và những cuốn bán chạy nhất." },
  { icon: ShieldCheck, title: "Tài khoản được bảo mật", desc: "Mật khẩu được mã hoá, thông tin thẻ không lưu trên hệ thống." },
];

export default function WhyChooseUs() {
  return (
    <section id="tai-sao" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-5">
      <div className="bg-card rounded-2xl border p-5 md:p-6">
        <div className="mb-2 border-b pb-4">
          <h2 className="text-2xl font-bold md:text-3xl">Vì sao nên mua sách tại ReadStore?</h2>
          <p className="text-muted-foreground mt-1 text-sm">Mua sách tiện lợi, minh bạch và an tâm.</p>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex gap-4 border-b py-5 sm:pr-6 [&:nth-last-child(-n+1)]:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:[&:nth-last-child(-n+3)]:border-b-0">
              <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

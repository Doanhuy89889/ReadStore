import { Clock, Mail, MapPin, Phone } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import ContactForm from "@/components/contact/ContactForm";


export const metadata = { title: "Liên hệ - ReadStore" };

const INFO = [
  { icon: MapPin, title: "Địa chỉ", value: "123 Đường ABC, TP.HCM" },
  { icon: Phone, title: "Điện thoại", value: "0900 000 000" },
  { icon: Mail, title: "Email", value: "hotro@readstore.vn" },
  { icon: Clock, title: "Giờ làm việc", value: "8:00 - 21:00, tất cả các ngày trong tuần" },
];

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold md:text-3xl">Liên hệ với ReadStore</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Bạn cần hỗ trợ về đơn hàng hay tư vấn chọn sách? Hãy để lại tin nhắn, chúng tôi sẽ phản hồi qua email.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            {INFO.map(({ icon: Icon, title, value }) => (
              <div key={title} className="bg-card flex items-start gap-4 rounded-xl border p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{title}</p>
                  <p className="mt-1 text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <ContactForm />
        </div>
      </div>
      
    </MainLayout>
  );
}

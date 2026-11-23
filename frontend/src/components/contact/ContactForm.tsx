"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { contactService } from "@/services/contactService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)[0-9]{9}$/;

type Errors = Partial<Record<"name" | "email" | "phone" | "subject" | "message", string>>;

export default function ContactForm() {
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // ô ẩn chống bot: người thật không điền
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // đã đăng nhập: điền sẵn thông tin
  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.displayName || "");
    setEmail((v) => v || user.email || "");
    setPhone((v) => v || user.phone || "");
  }, [user]);

  const validate = () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Vui lòng nhập họ tên";
    if (!EMAIL_REGEX.test(email.trim())) e.email = "Email không hợp lệ";
    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) e.phone = "Số điện thoại không hợp lệ (vd: 0912345678)";
    if (subject.trim().length < 3) e.subject = "Tiêu đề cần ít nhất 3 ký tự";
    if (message.trim().length < 10) e.message = "Nội dung cần ít nhất 10 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await contactService.send({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
        website,
      });
      setSent(true);
      setSubject("");
      setMessage("");
    } catch (e) {
      toast.error(
        isAxiosError(e) && e.response?.data?.message ? e.response.data.message : "Không gửi được tin nhắn, vui lòng thử lại"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-card rounded-xl border p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-emerald-600" />
        <h2 className="mt-4 text-xl font-bold">Đã gửi tin nhắn!</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi qua email <b>{email}</b> sớm nhất có thể.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Gửi tin nhắn khác
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-card space-y-4 rounded-xl border p-6">
      <h2 className="text-lg font-bold">Gửi tin nhắn cho chúng tôi</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">Họ tên</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={150} />
          {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-phone">Số điện thoại (không bắt buộc)</Label>
        <Input id="c-phone" inputMode="tel" placeholder="0912345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-subject">Tiêu đề</Label>
        <Input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} />
        {errors.subject && <p className="text-destructive text-sm">{errors.subject}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-message">Nội dung</Label>
        <textarea
          id="c-message"
          rows={6}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-input placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        />
        <div className="flex justify-between">
          {errors.message ? <p className="text-destructive text-sm">{errors.message}</p> : <span />}
          <span className="text-muted-foreground text-xs">{message.length}/2000</span>
        </div>
      </div>

      {/* ô chống bot: ẩn khỏi người dùng */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        <Send /> {submitting ? "Đang gửi..." : "Gửi tin nhắn"}
      </Button>
    </form>
  );
}

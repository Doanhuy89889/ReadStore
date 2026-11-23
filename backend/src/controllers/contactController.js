import { isBrevoConfigured, sendEmail } from "../libs/brevo.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(0|\+84)\d{9}$/;

// chống chèn HTML/script vào nội dung email
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const clean = (v) => String(v ?? "").trim();

// POST /api/contact   body: { name, email, phone?, subject, message, website? }
export const sendContactMessage = async (req, res) => {
  try {
    const body = req.body ?? {};

    // ô ẩn "website": người thật không điền, bot thường điền -> giả vờ thành công, không gửi gì
    if (clean(body.website)) return res.status(200).json({ message: "Đã gửi tin nhắn" });

    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const subject = clean(body.subject).replace(/[\r\n]+/g, " ");
    const message = clean(body.message);

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ message: "Vui lòng nhập họ tên (2-100 ký tự)" });
    }
    if (!EMAIL_REGEX.test(email) || email.length > 150) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }
    if (phone && !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
    }
    if (subject.length < 3 || subject.length > 150) {
      return res.status(400).json({ message: "Tiêu đề cần từ 3 đến 150 ký tự" });
    }
    if (message.length < 10 || message.length > 2000) {
      return res.status(400).json({ message: "Nội dung cần từ 10 đến 2000 ký tự" });
    }

    if (!isBrevoConfigured()) {
      console.error("Thiếu cấu hình Brevo: BREVO_API_KEY / BREVO_SENDER_EMAIL / CONTACT_RECEIVER_EMAIL");
      return res.status(503).json({ message: "Chức năng liên hệ tạm thời chưa khả dụng" });
    }

    // 1) gửi cho cửa hàng; bấm "Trả lời" sẽ gửi thẳng cho khách (replyTo)
    await sendEmail({
      to: [{ email: process.env.CONTACT_RECEIVER_EMAIL, name: "ReadStore" }],
      replyTo: { email, name },
      subject: `[Liên hệ] ${subject}`,
      html: `
        <h3>Tin nhắn liên hệ mới từ website</h3>
        <p><b>Họ tên:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Số điện thoại:</b> ${phone ? escapeHtml(phone) : "(không cung cấp)"}</p>
        <p><b>Tiêu đề:</b> ${escapeHtml(subject)}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });

    // 2) email xác nhận cho khách (không bắt buộc: lỗi cũng không làm hỏng việc gửi liên hệ)
    sendEmail({
      to: [{ email, name }],
      subject: "ReadStore đã nhận được tin nhắn của bạn",
      html: `
        <p>Chào ${escapeHtml(name)},</p>
        <p>Cảm ơn bạn đã liên hệ với ReadStore. Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất có thể.</p>
        <p><b>Nội dung bạn đã gửi:</b></p>
        <blockquote style="white-space:pre-wrap">${escapeHtml(message)}</blockquote>
        <p>Trân trọng,<br/>ReadStore</p>
      `,
    }).catch((e) => console.warn("Không gửi được email xác nhận cho khách:", e.message));

    return res.status(200).json({ message: "Đã gửi tin nhắn" });
  } catch (error) {
    console.error("Lỗi khi gọi sendContactMessage", error);
    return res.status(500).json({ message: "Không gửi được tin nhắn, vui lòng thử lại sau" });
  }
};

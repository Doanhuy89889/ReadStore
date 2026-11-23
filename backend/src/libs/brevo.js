const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export const isBrevoConfigured = () =>
  Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL && process.env.CONTACT_RECEIVER_EMAIL);

// to: [{ email, name? }]   replyTo: { email, name? }
export const sendEmail = async ({ to, subject, html, replyTo }) => {
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "ReadStore",
        email: process.env.BREVO_SENDER_EMAIL, // phải là email đã xác minh trong Brevo
      },
      to,
      subject,
      htmlContent: html,
      ...(replyTo ? { replyTo } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(`Brevo ${res.status}: ${data.message ?? "lỗi không rõ"}`);
    err.status = res.status;
    throw err;
  }

  return data; // { messageId }
};

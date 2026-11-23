import api from "@/lib/axios";

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  website?: string; // ô ẩn chống bot
}

export const contactService = {
  send: async (payload: ContactPayload): Promise<void> => {
    await api.post("/contact", payload);
  },
};

import { env } from "../../common/config/env.js";
import { sendMail } from "../../common/utils/mail.js";

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    await sendMail({ to, subject, text });
  } catch {
    return;
  }
};

export const triggerEvent = async (event: string, payload: Record<string, string>): Promise<void> => {
  if (!env.TRIGGER_DEV_WEBHOOK_URL) {
    return;
  }

  try {
    await fetch(env.TRIGGER_DEV_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, payload })
    });
  } catch {
    return;
  }
};

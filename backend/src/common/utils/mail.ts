import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: env.MAIL_SERVICE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export const sendMail = async (payload: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> => {
  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: payload.to,
    subject: payload.subject,
    text: payload.text
  });
};

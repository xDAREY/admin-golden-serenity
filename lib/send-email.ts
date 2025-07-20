// FILE: lib/send-email.ts
import { Resend } from "resend";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const resend = new Resend(apiKey);

  return await resend.emails.send({
    from: "Golden Serenity <info@goldenserenityhomecare.org>",
    to,
    subject,
    html,
  });
}

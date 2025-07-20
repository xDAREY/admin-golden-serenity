// FILE: lib/send-email.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(to: string, subject: string, html: string) {
  return await resend.emails.send({
    from: "Golden Serenity <info@goldenserenityhomecare.org>", 
    to,
    subject,
    html,
  })
}

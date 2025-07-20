// app/api/reply/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/send-email";

export async function POST(req: Request) {
  try {
    const { to, subject, message } = await req.json();

    // Validation
    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, subject, and message are required" }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address format" }, 
        { status: 400 }
      );
    }

    // Convert message to HTML (preserve line breaks)
    const htmlMessage = message.replace(/\n/g, '<br>');

    const data = await sendEmail(to, subject, `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${htmlMessage}</div>`);

    return NextResponse.json({ success: true, data });
    
  } catch (err: any) {
    
    // Handle specific Resend API errors
    if (err.message?.includes('API key')) {
      return NextResponse.json(
        { success: false, error: "Email service configuration error" }, 
        { status: 500 }
      );
    }

    if (err.message?.includes('rate limit')) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." }, 
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error occurred while sending email" }, 
      { status: 500 }
    );
  }
}
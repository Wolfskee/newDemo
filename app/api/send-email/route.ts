import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, and html/text" },
        { status: 400 }
      );
    }

    // 验证环境变量
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: "Email configuration is missing. Please check your .env.local file." },
        { status: 500 }
      );
    }

    const transporter = createTransporter();
    const businessEmail = process.env.BUSINESS_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: `"${process.env.BUSINESS_NAME || "Business"}" <${businessEmail}>`,
      to,
      subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, ""), // 如果没有 text，从 html 提取纯文本
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        messageId: info.messageId,
        message: "Email sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

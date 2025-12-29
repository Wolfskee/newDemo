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
      console.error("Missing SMTP configuration:", {
        hasHost: !!process.env.SMTP_HOST,
        hasUser: !!process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
      });
      return NextResponse.json(
        { error: "Email configuration is missing. Please check your .env.local file." },
        { status: 500 }
      );
    }

    try {
      const transporter = createTransporter();
      // SMTP 要求 from 地址必须与认证用户（SMTP_USER）相同
      // 使用 SMTP_USER 作为发送地址，但可以设置显示名称
      const fromEmail = process.env.SMTP_USER;
      const displayName = process.env.BUSINESS_NAME || "Business";

      const mailOptions = {
        from: `"${displayName}" <${fromEmail}>`,
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
    } catch (emailError) {
      console.error("Error sending email via SMTP:", emailError);
      const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
      const errorStack = emailError instanceof Error ? emailError.stack : undefined;
      
      return NextResponse.json(
        {
          error: "Failed to send email via SMTP",
          details: errorMessage,
          ...(process.env.NODE_ENV === 'development' && errorStack && { stack: errorStack }),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in send-email API route:", error);
    return NextResponse.json(
      {
        error: "Failed to process email request",
        details: error instanceof Error ? error.message : "Unknown error",
        ...(process.env.NODE_ENV === 'development' && error instanceof Error && { stack: error.stack }),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { addBooking } from "../bookings/route";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, date, time, service, description } = body;

    // Validate required fields
    if (!name || !email || !date || !time || !service) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get SMTP configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const businessEmail = process.env.BUSINESS_EMAIL;

    if (!smtpHost || !smtpUser || !smtpPass || !businessEmail) {
      console.error("SMTP configuration missing:", {
        hasHost: !!smtpHost,
        hasUser: !!smtpUser,
        hasPass: !!smtpPass,
        hasBusinessEmail: !!businessEmail,
      });
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Email content for business
    const businessEmailHtml = `
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Service:</strong> ${service}</p>
      ${description ? `<p><strong>Description:</strong> ${description}</p>` : ""}
      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
    `;

    // Send email to business
    await transporter.sendMail({
      from: `"Booking System" <${smtpUser}>`,
      to: businessEmail,
      subject: `New Booking Request from ${name}`,
      html: businessEmailHtml,
    });

    console.log("Booking email sent successfully to:", businessEmail);

    // Save booking to storage
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    addBooking({
      id: bookingId,
      name,
      email,
      date,
      time,
      service,
      description: description || "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking request submitted successfully! We'll contact you soon.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing booking:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process booking request" },
      { status: 500 }
    );
  }
}

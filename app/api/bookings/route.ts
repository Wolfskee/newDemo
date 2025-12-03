import { NextRequest, NextResponse } from "next/server";

// In production, this would fetch from a database
// For now, we'll use a simple in-memory store (in production, use a database)
// This is just for demo purposes

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  description?: string;
  createdAt: string;
}

// In-memory storage (replace with database in production)
let bookings: Booking[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Filter bookings by email
    const userBookings = bookings.filter((booking) => booking.email === email);

    return NextResponse.json(
      {
        success: true,
        bookings: userBookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// Store booking (called from booking route)
export function addBooking(booking: Booking) {
  bookings.push(booking);
}

// Export for use in booking route
export { bookings };

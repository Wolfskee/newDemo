import { NextRequest, NextResponse } from "next/server";
import { bookings } from "../bookings/route";

interface User {
  id: string;
  email: string;
  role: "user" | "admin" | "employee";
  createdAt: string;
  lastLogin?: string;
  bookingsCount?: number;
}

// In-memory storage (replace with database in production)
let users: User[] = [
  {
    id: "1",
    email: "user1@example.com",
    role: "user",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    bookingsCount: 3,
  },
  {
    id: "2",
    email: "user2@example.com",
    role: "user",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    bookingsCount: 1,
  },
  {
    id: "3",
    email: "user3@example.com",
    role: "user",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    bookingsCount: 5,
  },
  {
    id: "4",
    email: "employee@example.com",
    role: "employee",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    bookingsCount: 0,
  },
];

export async function GET() {
  try {
    // Calculate booking counts for each user
    const usersWithBookings = users.map((user) => {
      const userBookings = bookings.filter((b) => b.email === user.email);
      return {
        ...user,
        bookingsCount: userBookings.length,
      };
    });

    return NextResponse.json(
      {
        success: true,
        users: usersWithBookings,
        total: usersWithBookings.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      role: role || "user",
      createdAt: new Date().toISOString(),
      bookingsCount: 0,
    };

    users.push(newUser);

    return NextResponse.json(
      {
        success: true,
        user: newUser,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, role } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      email: email || users[userIndex].email,
      role: role || users[userIndex].role,
    };

    return NextResponse.json(
      {
        success: true,
        user: users[userIndex],
        message: "User updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    users.splice(userIndex, 1);

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

// Export for use in other routes
export { users };

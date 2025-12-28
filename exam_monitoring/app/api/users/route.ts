import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/Users";

// API Route: POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await dbConnect();

    // Check required fields
    const requiredFields = ["idNumber", "name", "email", "password", "role"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ idNumber: body.idNumber }, { email: body.email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User with this ID or email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const user = await User.create(body);

    // Return without password
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(
      { success: true, user: userObj },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// API Route: GET /api/users - Get all users (for admin)
export async function GET() {
  try {
    await dbConnect();

    const users = await User.find({}).select("-password").lean();

    return NextResponse.json({ success: true, users });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
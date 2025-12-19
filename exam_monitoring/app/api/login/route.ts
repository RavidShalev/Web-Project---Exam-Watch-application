import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/Users";

// API Route: POST /api/login
export async function POST(req: Request) {
  try {
    // reading the data that has been sent from the frontend (username, password)
    const { username, password } = await req.json();

    await dbConnect();
    
    // searching the user from the username
    const user = await User.findOne({ username });

    // checking if the user doesn't exist or the db doesn't match what the user typed
    if (!user || user.password !== password) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // if no errors return to the user the information
    return NextResponse.json({
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/Users";
import bcrypt from "bcryptjs";


// API Route: POST /api/login
export async function POST(req: Request) {
  try {
    await dbConnect();

    // reading the data that has been sent from the frontend (idNumber, password)
    const { idNumber, password } = await req.json();

    // checking input validation
    if (!idNumber || !password) {
      return NextResponse.json(
        { message: "נא להזין תעודת זהות וסיסמה" },
        { status: 400 }
      );
    }
    
    const cleanIdNumber = idNumber.trim();
    const cleanPassword = password.trim();
    
    const user = await User.findOne({ idNumber: cleanIdNumber });

    if (!user) {
      return NextResponse.json(
        { message: "שם משתמש או סיסמה שגויים" },
        { status: 401 }
      );
    }

    //check password matching with hashed password
    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "שם משתמש או סיסמה שגויים" },
        { status: 401 }
      );
    }

    // if no errors return to the user the information
    return NextResponse.json({
      _id: user._id.toString(),
      idNumber: user.idNumber,
      name: user.name,
      role: user.role,
    });
    
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}

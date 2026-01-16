import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/Users";
import bcrypt from "bcryptjs"; 


// API Route: POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. extract fields from the request body
    const { name, idNumber, email, phone, password, role } = body;

    // 2. check for required fields
    if (!name || !idNumber || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "חסרים שדות חובה: שם, ת.ז, אימייל, סיסמה או תפקיד" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. check if user with same idNumber or email already exists
    const existingUser = await User.findOne({
      $or: [{ idNumber }, { email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "משתמש עם תעודת זהות או אימייל זה כבר קיים" },
        { status: 409 }
      );
    }

    // 4. encryption of the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. create the new user
    const newUser = await User.create({
      name,
      idNumber,
      email,
      phone,
      role,
      password: hashedPassword, // save the hashed password
    });

    // ✅ Log new user registration to audit log for admin dashboard
    const { logAuditAction } = await import("../../lib/auditLogger");
    await logAuditAction({
        actionType: 'USER_REGISTERED',
        description: `משתמש חדש נרשם: ${newUser.name} (${newUser.role})`,
        metadata: {
            userName: newUser.name,
            userRole: newUser.role,
            userEmail: newUser.email,
        }
    });

    // 6. answer without the password field
    const userObj = newUser.toObject();
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
  // fetch all users without passwords
    const users = await User.find({}).select("-password").lean();

    return NextResponse.json({ success: true, users });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
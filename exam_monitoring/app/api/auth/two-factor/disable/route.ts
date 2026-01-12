export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import User from "../../../../models/Users";

// API Route: POST /api/auth/two-factor/disable
// Purpose: Turn off 2FA for a user
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "חסר מזהה משתמש" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "משתמש לא נמצא" },
        { status: 404 }
      );
    }

    // Disable 2FA and clear the secret
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "אימות דו-שלבי כובה בהצלחה",
    });

  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { message: "שגיאה בביטול אימות דו-שלבי" },
      { status: 500 }
    );
  }
}

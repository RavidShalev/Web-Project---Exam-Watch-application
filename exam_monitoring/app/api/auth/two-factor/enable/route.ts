export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import User from "../../../../models/Users";

// API Route: POST /api/auth/two-factor/enable
// Purpose: Enable 2FA for a user (no setup needed - just turn it on!)
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

    // Simple: just enable 2FA - no QR code, no setup needed!
    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "אימות דו-שלבי הופעל בהצלחה! בהתחברות הבאה תקבל קוד למייל.",
    });

  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json(
      { message: "שגיאה בהפעלת אימות דו-שלבי" },
      { status: 500 }
    );
  }
}

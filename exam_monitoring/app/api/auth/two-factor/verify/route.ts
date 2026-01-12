export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import User from "../../../../models/Users";
import speakeasy from "speakeasy";

// API Route: POST /api/auth/two-factor/verify
// Purpose: Verify the 6-digit code from user's authenticator app and enable 2FA
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { message: "חסרים פרטים נדרשים" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(userId);

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { message: "משתמש לא נמצא או לא הוגדר אימות דו-שלבי" },
        { status: 404 }
      );
    }

    // Verify the 6-digit code that user entered
    // speakeasy checks if the code matches the current time window (30 seconds)
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret, // The secret we saved earlier
      encoding: "base32",
      token: token, // The 6-digit code from user
      window: 2, // Allow codes from 1 minute before/after (flexibility for time sync issues)
    });

    if (!verified) {
      return NextResponse.json(
        { message: "קוד שגוי. נסה שוב" },
        { status: 401 }
      );
    }

    // Code is correct! Enable 2FA for this user
    user.twoFactorEnabled = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "אימות דו-שלבי הופעל בהצלחה!",
    });

  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { message: "שגיאה באימות קוד" },
      { status: 500 }
    );
  }
}

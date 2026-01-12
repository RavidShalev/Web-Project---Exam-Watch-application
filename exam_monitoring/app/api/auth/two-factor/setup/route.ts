export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import User from "../../../../models/Users";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// API Route: POST /api/auth/two-factor/setup
// Purpose: Generate a secret key and QR code for the user to scan with their authenticator app
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

    // Find the user in database
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "משתמש לא נמצא" },
        { status: 404 }
      );
    }

    // Generate a unique secret key for this user
    // This secret will be used to generate time-based codes
    const secret = speakeasy.generateSecret({
      name: `Exam Watch (${user.name})`, // Name shown in authenticator app
      issuer: "Exam Watch", // App name
    });

    // Save the secret to the database (but don't enable 2FA yet)
    // User must verify they can generate codes before we enable it
    user.twoFactorSecret = secret.base32; // base32 format - standard for TOTP
    await user.save();

    // Generate QR code that the user will scan with Google Authenticator or similar app
    // The QR code contains: secret key, app name, user email
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    return NextResponse.json({
      success: true,
      secret: secret.base32, // Secret in text format (backup)
      qrCode: qrCodeUrl, // QR code image (data URL)
      message: "סרוק את קוד ה-QR באפליקציית האימות שלך",
    });

  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { message: "שגיאה בהגדרת אימות דו-שלבי" },
      { status: 500 }
    );
  }
}

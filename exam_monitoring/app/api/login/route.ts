export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/Users";
import bcrypt from "bcryptjs";
import { sendTwoFactorCode } from "../../lib/emailService";


// API Route: POST /api/login
export async function POST(req: Request) {
  try {
    await dbConnect();

    // reading the data that has been sent from the frontend (idNumber, password, twoFactorCode)
    const { idNumber, password, twoFactorCode } = await req.json();

    // checking input validation
    if (!idNumber || !password) {
      return NextResponse.json(
        { message: "נא להזין תעודת זהות וסיסמה" },
        { status: 400 }
      );
    }
    
    const cleanIdNumber = idNumber.trim();
    const cleanPassword = password.trim();
    
    // Try to find user by ID number
    const user = await User.findOne({ idNumber: cleanIdNumber });

    // If user doesn't exist - show generic error (for security)
    if (!user) {
      return NextResponse.json(
        { message: "תעודת זהות או סיסמה שגויים" },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.isLocked && user.lockedUntil) {
      const now = new Date();
      
      // If lock time has passed, unlock the account automatically
      if (now > user.lockedUntil) {
        user.isLocked = false;
        user.lockedUntil = null;
        user.failedLoginAttempts = 0;
        await user.save();
      } else {
        // Account is still locked - show error message
        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 60000);
        return NextResponse.json(
          { message: `החשבון נעול. נסה שוב בעוד ${minutesLeft} דקות` },
          { status: 403 }
        );
      }
    }

    // Check password matching with hashed password
    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      // PASSWORD IS WRONG - Only here we count failed attempts (user exists!)
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      const MAX_ATTEMPTS = 5; // Maximum allowed failed attempts
      const LOCK_TIME_MINUTES = 15; // How long to lock the account
      
      if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
        // Lock the account for 15 minutes
        user.isLocked = true;
        user.lockedUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        await user.save();
        
        return NextResponse.json(
          { message: `החשבון ננעל לאחר ${MAX_ATTEMPTS} ניסיונות כושלים. נסה שוב בעוד ${LOCK_TIME_MINUTES} דקות` },
          { status: 403 }
        );
      }
      
      // Save the updated failed attempts count
      await user.save();
      
      const attemptsLeft = MAX_ATTEMPTS - user.failedLoginAttempts;
      return NextResponse.json(
        { message: `סיסמה שגויה. נותרו ${attemptsLeft} ניסיונות` },
        { status: 401 }
      );
    }

    // Password is correct - reset security fields
    if (user.failedLoginAttempts > 0 || user.isLocked) {
      user.failedLoginAttempts = 0;
      user.isLocked = false;
      user.lockedUntil = null;
      await user.save();
    }

    // Check if user has Two-Factor Authentication enabled
    if (user.twoFactorEnabled) {
      // If 2FA code was not provided yet
      if (!twoFactorCode) {
        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save code to database with expiry time (10 minutes from now)
        user.twoFactorCode = code;
        user.twoFactorCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        // Send code to user's email
        await sendTwoFactorCode(user.email, user.name, code);

        return NextResponse.json({
          requiresTwoFactor: true, // Signal to frontend: show 2FA code input
          message: "קוד אימות נשלח למייל שלך",
        }, { status: 200 });
      }

      // User provided a 2FA code - verify it
      const now = new Date();
      
      // Check if code exists and not expired
      if (!user.twoFactorCode || !user.twoFactorCodeExpiry) {
        return NextResponse.json(
          { message: "קוד אימות לא נמצא. נסה להתחבר שוב" },
          { status: 401 }
        );
      }

      // Check if code expired (more than 10 minutes old)
      if (now > user.twoFactorCodeExpiry) {
        return NextResponse.json(
          { message: "קוד אימות פג תוקף. נסה להתחבר שוב" },
          { status: 401 }
        );
      }

      // Check if code matches
      if (twoFactorCode !== user.twoFactorCode) {
        return NextResponse.json(
          { message: "קוד אימות שגוי" },
          { status: 401 }
        );
      }

      // Code is correct! Clear the used code
      user.twoFactorCode = null;
      user.twoFactorCodeExpiry = null;
      await user.save();
    }

    // All checks passed (password + 2FA if enabled) - user can login!
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

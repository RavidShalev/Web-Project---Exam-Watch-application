export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import User from "../../models/Users";
import bcrypt from "bcryptjs";

// Configuration constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * POST /api/login
 * Authenticates a user by ID number and password.
 * Includes account lockout after multiple failed login attempts.
 */
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

    // Check if account is locked
    if (user.accountLocked && user.lockedUntil) {
      const now = new Date();
      if (now < user.lockedUntil) {
        const minutesLeft = Math.ceil(
          (user.lockedUntil.getTime() - now.getTime()) / 60000
        );
        return NextResponse.json(
          {
            message: `החשבון נעול עד ${user.lockedUntil.toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit'
            })} (עוד ${minutesLeft} דקות)`,
            locked: true,
            lockedUntil: user.lockedUntil
          },
          { status: 423 } // 423 = Locked
        );
      } else {
        // Lock time expired, unlock account
        user.accountLocked = false;
        user.failedLoginAttempts = 0;
        user.lockedUntil = undefined;
        await user.save();
      }
    }

    //check password matching with hashed password
    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account if max attempts reached
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.accountLocked = true;
        user.lockedUntil = new Date(Date.now() + LOCK_TIME);
        await user.save();
        
        // Log security event
        const { logAuditAction } = await import("../../lib/auditLogger");
        await logAuditAction({
          actionType: 'CRITICAL_REPORT',
          description: `חשבון נעול: ${user.name} - יותר מדי ניסיונות כושלים`,
          userId: user._id.toString(),
          metadata: {
            attempts: user.failedLoginAttempts,
            lockedUntil: user.lockedUntil
          }
        });
        
        return NextResponse.json(
          {
            message: `החשבון ננעל למשך 30 דקות עקב ניסיונות כניסה כושלים מרובים`,
            locked: true,
            lockedUntil: user.lockedUntil
          },
          { status: 423 }
        );
      }
      
      await user.save();
      
      // Return attempts left
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts;
      return NextResponse.json(
        { 
          message: `שם משתמש או סיסמה שגויים. נותרו ${attemptsLeft} ניסיונות`,
          attemptsLeft
        },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.accountLocked = false;
      user.lockedUntil = undefined;
      await user.save();
    }

    // ✅ Log successful login to audit log for admin dashboard
    const { logAuditAction } = await import("../../lib/auditLogger");
    await logAuditAction({
        actionType: 'SYSTEM_LOGIN',
        description: `${user.name} התחבר למערכת`,
        userId: user._id.toString(),
        metadata: {
            userName: user.name,
            userRole: user.role,
        }
    });

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

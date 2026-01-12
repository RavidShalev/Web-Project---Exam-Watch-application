import mongoose from "mongoose";

const ALLOWED_ROLES = ["admin", "supervisor", "lecturer", "student"] as const;

const UserSchema = new mongoose.Schema(
  {
    idNumber: { 
      type: String, 
      required: true, 
      unique: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    phone: { 
      type: String, 
      required: false 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      required: true,
      enum: ALLOWED_ROLES,
      default: "student",
    },
    // Security fields for account locking
    failedLoginAttempts: {
      type: Number,
      default: 0, // Count how many times login failed
    },
    isLocked: {
      type: Boolean,
      default: false, // Is the account currently locked?
    },
    lockedUntil: {
      type: Date,
      default: null, // When will the account be unlocked automatically?
    },
    // Two-Factor Authentication (2FA) via Email - Simple approach
    twoFactorEnabled: {
      type: Boolean,
      default: false, // Is 2FA currently active for this user?
    },
    twoFactorCode: {
      type: String,
      default: null, // Temporary 6-digit code sent to user's email
    },
    twoFactorCodeExpiry: {
      type: Date,
      default: null, // When does the code expire? (usually 10 minutes)
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
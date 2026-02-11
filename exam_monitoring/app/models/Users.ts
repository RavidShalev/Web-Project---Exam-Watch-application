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
    // 🔒 Security fields for account locking
    failedLoginAttempts: {
      type: Number,
      default: 0,
      required: false,
    },
    accountLocked: {
      type: Boolean,
      default: false,
      required: false,
    },
    lockedUntil: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
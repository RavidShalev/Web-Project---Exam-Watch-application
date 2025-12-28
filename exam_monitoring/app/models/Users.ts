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
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
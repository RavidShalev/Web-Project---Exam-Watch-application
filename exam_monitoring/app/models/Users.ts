import mongoose from "mongoose";

const ALLOWED_ROLES = ["admin", "proctor", "lecturer", "student"] as const;

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true},
    password: { type: String, required: true },
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

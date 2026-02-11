import mongoose from "mongoose";

/**
 * SupervisorStatus Model
 * Tracks the status of supervisors during an exam
 */
const SupervisorStatusSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "busy", "on_break", "away"],
      default: "available",
      required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
SupervisorStatusSchema.index({ examId: 1, supervisorId: 1 }, { unique: true });
SupervisorStatusSchema.index({ examId: 1, status: 1 });

export default mongoose.models.SupervisorStatus || 
  mongoose.model("SupervisorStatus", SupervisorStatusSchema);

import mongoose from "mongoose";

/**
 * Communication Model
 * Stores messages between supervisors during an exam
 */
const CommunicationSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["message", "status_update", "emergency"],
      default: "message",
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CommunicationSchema.index({ examId: 1, createdAt: -1 });
CommunicationSchema.index({ senderId: 1 });

export default mongoose.models.Communication || 
  mongoose.model("Communication", CommunicationSchema);

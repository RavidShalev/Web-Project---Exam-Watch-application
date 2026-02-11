import mongoose from "mongoose";

// P2P Peer Schema - for signaling/peer discovery
const P2PPeerSchema = new mongoose.Schema(
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
    supervisorName: {
      type: String,
      required: true,
    },
    supervisorIdNumber: {
      type: String,
      required: true,
    },
    peerId: {
      type: String,
      required: true,
      unique: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
P2PPeerSchema.index({ examId: 1, supervisorId: 1 }, { unique: true });

// TTL index - automatically remove inactive peers after 5 minutes
P2PPeerSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 300 });

const P2PPeer = mongoose.models.P2PPeer || mongoose.model("P2PPeer", P2PPeerSchema);

export default P2PPeer;

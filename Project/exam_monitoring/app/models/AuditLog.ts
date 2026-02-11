import mongoose from "mongoose";

/**
 * AuditLog Model
 * Stores system-wide important actions for admin monitoring
 * Only stores significant events like exam start/end, not every small action
 */
const AuditLogSchema = new mongoose.Schema(
  {
    // Type of action performed
    actionType: {
      type: String,
      required: true,
      enum: [
        'EXAM_STARTED',      // Exam was activated
        'EXAM_FINISHED',     // Exam was completed
        'USER_REGISTERED',   // New user registered by admin
        'SYSTEM_LOGIN',      // User logged in
        'GENERAL_REPORT',    // General incident report
        'CRITICAL_REPORT',   // Critical incident reported
      ]
    },
    
    // Description of the action in Hebrew
    description: {
      type: String,
      required: true,
    },
    
    // User who performed the action
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Some system actions might not have a user
    },
    
    // Related exam if applicable
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: false,
    },
    
    // Additional metadata (flexible for different action types)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // IP address of the user (security)
    ipAddress: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
AuditLogSchema.index({ createdAt: -1 }); // Sort by newest first
AuditLogSchema.index({ actionType: 1 });
AuditLogSchema.index({ userId: 1 });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);

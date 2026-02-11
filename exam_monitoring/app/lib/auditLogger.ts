import AuditLog from "../models/AuditLog";
import dbConnect from "./db";

// Legacy type for backward compatibility
type AuditLoggerParams={
    userId: string;
    action: string;
    examId?: string;
    status: boolean;
}

// Legacy function - kept for backward compatibility
// Logs an audit event to the database
export async function logAuditEvent(params: AuditLoggerParams): Promise<void> {
    const { userId, action, examId, status } = params;

    try {
        await dbConnect();
        await AuditLog.create({
            actionType: 'SYSTEM_LOGIN',
            description: action,
            userId: userId || null,
            examId: examId || null,
            metadata: { status },
        });
    } catch (error) {
        console.error("Failed to log audit event:", error);
    }
}

/**
 * Helper function to log important system actions
 * Use this whenever a significant event occurs in the system
 * This is for admin monitoring - only log important events, not every small action
 */
export async function logAuditAction({
  actionType,
  description,
  userId,
  examId,
  metadata = {},
  ipAddress,
}: {
  actionType: string;
  description: string;
  userId?: string;
  examId?: string;
  metadata?: any;
  ipAddress?: string;
}) {
  try {
    await dbConnect();
    
    await AuditLog.create({
      actionType,
      description,
      userId: userId || null,
      examId: examId || null,
      metadata,
      ipAddress: ipAddress || null,
    });
    
    console.log(`✅ Audit log created: ${actionType}`);
  } catch (error) {
    // Don't break the main flow if logging fails
    // Just log the error and continue
    console.error("❌ Failed to create audit log:", error);
  }
}

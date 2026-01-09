import AuditAction from "../models/AuditAction";

type AuditLoggerParams={
    userId: string;
    action: string;
    examId?: string;
    status: boolean;
}

// Logs an audit event to the database
export async function logAuditEvent(params: AuditLoggerParams): Promise<void> {
    const { userId, action, examId, status } = params;

    try {
        await AuditAction.create({
            userId,
            action,
            examId: examId || null,
            status,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Failed to log audit event:", error);
    }
}

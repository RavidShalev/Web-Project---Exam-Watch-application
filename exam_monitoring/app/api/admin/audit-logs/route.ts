import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import AuditLog from "../../../models/AuditLog";

/**
 * GET /api/admin/audit-logs
 * Fetch audit logs for admin dashboard
 * Supports pagination and filtering by action type
 * Only accessible by admin users
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Filter by action type if provided
    const actionType = searchParams.get("actionType");
    const filter: any = {};
    
    if (actionType && actionType !== "ALL") {
      filter.actionType = actionType;
    }

    // Fetch logs with populated user and exam data
    const logs = await AuditLog.find(filter)
      .populate("userId", "name role idNumber")
      .populate("examId", "courseName location")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await AuditLog.countDocuments(filter);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalLogs: totalCount,
        logsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { success: false, message: "שגיאה בטעינת יומן הפעולות" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import SupervisorStatus from "../../../../models/SupervisorStatus";

/**
 * GET /api/exams/[examId]/supervisor-status
 * Get status of all supervisors for an exam
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    await dbConnect();
    const { examId } = await context.params;

    // Fetch all supervisor statuses for this exam
    const statuses = await SupervisorStatus.find({ examId })
      .populate("supervisorId", "name idNumber")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      statuses,
    });
  } catch (err) {
    console.error("Error fetching supervisor statuses:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
        statuses: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exams/[examId]/supervisor-status
 * Update supervisor status
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    await dbConnect();
    const { examId } = await context.params;
    const { supervisorId, status, location } = await req.json();

    if (!supervisorId || !status) {
      return NextResponse.json(
        { message: "Missing supervisorId or status in request body" },
        { status: 400 }
      );
    }

    // Update or create supervisor status
    const supervisorStatus = await SupervisorStatus.findOneAndUpdate(
      { examId, supervisorId },
      {
        examId,
        supervisorId,
        status,
        location: location || "",
        lastSeen: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    ).populate("supervisorId", "name idNumber");

    return NextResponse.json({
      success: true,
      status: supervisorStatus,
    });
  } catch (err) {
    console.error("Error updating supervisor status:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Report from "../../../../models/Report";
import {logAuditEvent} from "../../../../lib/auditLogger";

/**
 * GET /api/exams/[examId]/reporting
 * Returns all incident and event reports related to a specific exam.
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    await dbConnect();
    const { examId } = await context.params;

    // Fetch all reports for this exam, populated with user info
    const reports = await Report.find({ examId })
      .populate("supervisorId", "name")
      .populate("studentId", "name idNumber")
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    return NextResponse.json({
      success: true,
      data: reports,
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
        data: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exams/[examId]/reporting
 * Creates a general exam report (not tied to a specific student),
 * submitted by a supervisor and logged in the audit system.
 */
export async function POST( req: Request, context: { params: Promise<{ examId: string; }> })
{
  try {
          // connect to the database, if already connected, does nothing
          await dbConnect();
          const { examId} = await context.params;
          const { eventType, description, userId } = await req.json();
  
          if (!eventType ) {
            await logAuditEvent({userId, action: "הוספת דיווח כללי", examId: examId.toString(), status: false,});
              return NextResponse.json(
                  { message: "Missing eventType in request body" },
                  { status: 400 }
              );
          }
  
          const report = await Report.create({
              examId: examId,
              eventType: eventType,
              description: description || "",
              supervisorId: userId,
              createdAt: new Date(),
          });
          await logAuditEvent({userId, action: "הוספת דיווח כללי", examId: examId.toString(), status: true,});
          return NextResponse.json({ message: "Report created successfully", report });
      } catch (err) {
        console.error("Error creating report:", err);
          return NextResponse.json(
              { message: err instanceof Error ? err.message : "Unknown server error" },
              { status: 500 }
          );
      }
  }
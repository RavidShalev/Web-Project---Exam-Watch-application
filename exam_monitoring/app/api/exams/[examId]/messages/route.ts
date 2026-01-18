import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Communication from "../../../../models/Communication";
import { logAuditEvent } from "../../../../lib/auditLogger";

/**
 * GET /api/exams/[examId]/messages
 * Get all messages for an exam
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    await dbConnect();
    const { examId } = await context.params;

    // Fetch all messages for this exam, populated with sender info
    const messages = await Communication.find({ examId })
      .populate("senderId", "name idNumber")
      .sort({ createdAt: 1 }) // Oldest first for chat display
      .lean();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
        messages: [],
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exams/[examId]/messages
 * Send a new message
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    await dbConnect();
    const { examId } = await context.params;
    const { senderId, message, messageType } = await req.json();

    if (!senderId || !message) {
      return NextResponse.json(
        { message: "Missing senderId or message in request body" },
        { status: 400 }
      );
    }

    const communication = await Communication.create({
      examId,
      senderId,
      message,
      messageType: messageType || "message",
      readBy: [{ userId: senderId, readAt: new Date() }], // Sender has read their own message
    });

    await logAuditEvent({
      userId: senderId,
      action: "שליחת הודעה במהלך בחינה",
      examId: examId.toString(),
      status: true,
    });

    // Populate sender info before returning
    const populatedMessage = await Communication.findById(communication._id)
      .populate("senderId", "name idNumber")
      .lean();

    return NextResponse.json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    console.error("Error creating message:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

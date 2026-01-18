import { NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/db";
import Communication from "../../../../../../models/Communication";

/**
 * POST /api/exams/[examId]/messages/[messageId]/read
 * Mark a message as read by a supervisor
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ examId: string; messageId: string }> }
) {
  try {
    await dbConnect();
    const { messageId } = await context.params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId in request body" },
        { status: 400 }
      );
    }

    // Check if already read by this user
    const message = await Communication.findById(messageId);
    if (!message) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    const alreadyRead = message.readBy.some(
      (r: any) => r.userId.toString() === userId
    );

    if (!alreadyRead) {
      await Communication.findByIdAndUpdate(messageId, {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message marked as read",
    });
  } catch (err) {
    console.error("Error marking message as read:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

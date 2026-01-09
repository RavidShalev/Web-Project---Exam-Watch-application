import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Exam from "../../../../models/Exams";
import {logAuditEvent} from "../../../../lib/auditLogger";

// API route to add time to an exam's duration
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  await dbConnect();

  const { examId } = await params;

  const { minutesToAdd, userId } = await request.json();

  const exam = await Exam.findByIdAndUpdate(
    examId, 
    { $inc: { durationMinutes: minutesToAdd } },
    { new: true }
  );
  await logAuditEvent({userId, action: "הוספת זמן בחינה", examId: exam._id.toString(), status: true,});
  return NextResponse.json({ exam });
}
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Exam from "../../../../models/Exams";

// API route to add time to an exam's duration
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  await dbConnect();

  const { examId } = await params;

  const { minutesToAdd } = await request.json();

  const exam = await Exam.findByIdAndUpdate(
    examId, // ✅ משתמשים ב־examId, לא ב־params.examId
    { $inc: { durationMinutes: minutesToAdd } },
    { new: true }
  );

  return NextResponse.json({ exam });
}
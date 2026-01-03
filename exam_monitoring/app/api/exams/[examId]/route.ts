import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

// GET /api/exams/[examId] - Retrieve exam details by ID
export async function GET(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await context.params; 

    await dbConnect();

    const exam = await Exam.findById(examId);

    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/exams/[examId] - Update exam status to 'finished'
export async function PATCH(req: Request, context: { params: Promise<{ examId: string }> }) {
  try {
    const { examId } = await context.params;
    await dbConnect();

    const updatedExam = await Exam.findByIdAndUpdate(
      examId, {
        status: "finished",
      },
      { new: true }
    );

    if (!updatedExam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Exam updated successfully", exam: updatedExam });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

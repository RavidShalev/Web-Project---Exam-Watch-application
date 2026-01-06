import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../lib/db";
import Exam from "../../../../models/Exams";
import "../../../../models/Users";

// API Route to get exam by ID with populated lecturers, supervisors, and students
export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json(
        { success: false, message: "Invalid exam id" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch exam by ID with populated lecturers, supervisors, and students
    const exam = await Exam.findById(examId)
      .populate("lecturers", "idNumber name")
      .populate("supervisors", "idNumber name")
      .populate("students", "idNumber name");

    if (!exam) {
      return NextResponse.json(
        { success: false, message: "Exam not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, exam });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}

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

// API route to handle deletion of an exam by ID
export async function DELETE(
  req: Request,
  context: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await context.params;  
    await dbConnect();

    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Exam deleted successfully" },
      { status: 200 }
    );
  }
  catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

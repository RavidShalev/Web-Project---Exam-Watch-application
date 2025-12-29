import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

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

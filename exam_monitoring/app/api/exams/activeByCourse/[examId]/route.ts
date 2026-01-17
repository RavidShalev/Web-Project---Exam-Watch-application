import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Exam from "../../../../models/Exams";

export async function GET(req: Request,  { params }: { params: Promise<{ examId: string }>}) {
  try {
    await dbConnect();

    const { examId } = await params;

    if (!examId) {
      return NextResponse.json(
        { message: "Missing examId" },
        { status: 400 }
      );
    }

    // find this exam to know its details
    const currentExam = await Exam.findById(examId);

    if (!currentExam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    // get all the active exam of the same courseId
    const exams = await Exam.find({
      courseCode: currentExam.courseCode,
      status: "active",
    }).select("_id location");

    return NextResponse.json({ exams });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
  }

  try {
    await dbConnect();

    // Fetch exams for the given studentId from the database
    const exams = await Exam.find({ students: studentId }).sort({ date: 1 });

    return NextResponse.json({ success: true, data: exams });
  } catch (error) {
    console.error("Error fetching student exams:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
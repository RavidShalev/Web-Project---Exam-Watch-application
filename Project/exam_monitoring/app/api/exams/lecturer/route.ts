import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

/**
 * GET /api/exams/lecturer?lecturerId=...
 * Returns all exams assigned to a specific lecturer,
 * sorted by date and start time.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lecturerId = searchParams.get("lecturerId");

    if (!lecturerId) {
      return NextResponse.json(
        { success: false, message: "לא סופק מזהה מרצה" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find all exams where this lecturer is in the lecturers array
    const exams = await Exam.find({
      lecturers: lecturerId,
    })
      .populate("lecturers", "name idNumber")
      .populate("supervisors", "name idNumber")
      .sort({ date: 1, startTime: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: exams,
    });
  } catch (error) {
    console.error("Error fetching lecturer exams:", error);
    return NextResponse.json(
      { success: false, message: "שגיאת שרת" },
      { status: 500 }
    );
  }
}

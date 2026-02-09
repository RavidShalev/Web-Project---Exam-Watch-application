import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

/**
 * GET /api/exams
 *
 * Returns all exams from the database
 * with populated lecturers and supervisors.
 */
export async function GET() {
  try {

    await dbConnect();

    // Fetch exams with populate lecturers and supervisors fields
    const exams = await Exam.find()
      .populate("lecturers", "name")
      .populate("supervisors", "name");

    // Return the exams in the response
    return NextResponse.json({
      success: true,
      exams,
    });
  } catch (err) {
    console.error("Failed to fetch exams:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}

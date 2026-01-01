import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

// API Route: GET all exams from the db
export async function GET() {
  try {

    await dbConnect();

    // Fetch all exams, sorted by date
    const exams = await Exam.find();

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

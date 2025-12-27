import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import Exam from "../../models/Exams";

/*
 * Checks whether there is another exam in the same location and date
 * with an overlapping time range.
 * Only scheduled or active exams are considered.
 */
async function hasExamTimeConflict(
  location: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const conflict = await Exam.findOne({
    location,
    date,
    status: { $in: ["scheduled", "active"] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  }).lean();

  // null -> false, object -> true
  return !!conflict;
}

// API Route: POST /api/exams
export async function POST(req: Request) {
  try {
    // Reading the data sent from the frontend (all exam properties)
    const body = await req.json();

    await dbConnect();

    // Basic validation for required fields
    const requiredFields = [
      "courseName",
      "courseCode",
      "lecturers",
      "supervisors",
      "date",
      "startTime",
      "endTime",
      "location",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Checking if the exam can be created in the schedule
    const hasConflict = await hasExamTimeConflict(
      body.location,
      body.date,
      body.startTime,
      body.endTime
    );

    // If a conflict exists, the exam cannot be created
    if (hasConflict) {
      return NextResponse.json(
        {
          success: false,
          message:
            "There is already an exam in this location during the selected time range",
        },
        { status: 409 }
      );
    }

    // Creating the exam in the database
    const exam = await Exam.create({
      ...body,
      status: body.status || "scheduled",
    });

    return NextResponse.json(
      { success: true, exam },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating exam:", err);

    return NextResponse.json(
      {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import Exam from "../../models/Exams";

/*
 * Checks whether there is another exam in the same location and date
 * with an overlapping time range
 */
async function hasExamTimeConflict(
  location: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const conflict = await Exam.findOne({
    location: location,
    date: date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });

  // null -> false, obj -> true
  return !!conflict;
}


// API Route: POST /api/exams
export async function POST(req: Request) {
  try {
    // reading the data that has been sent from the frontend (all of the exam properties)
    const body = await req.json();

    await dbConnect();
    
    // checking if the exam can be created in the schedule
    const hasConflict = await hasExamTimeConflict(body.location, body.date, body.startTime, body.endTime);

    // if it returns true we wouldn't be able to create the exam inside the db
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

    // creating the exam inside the db
    const exam = await Exam.create(body);

    return NextResponse.json(
      { success: true, exam },
      { status: 201 }
    );

  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
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

// Default checklist items for new exams
const checklist = [
  {
    id: "distance",
    description: "כל הסטודנטים יושבים במרחק של שני כסאות זה מזה",
    isDone: false,
  },
  {
    id: "bags-front",
    description: "כל התיקים בקדמת הכיתה",
    isDone: false,
  },
  {
    id: "exam-on-board",
    description: "פרטי הבחינה שנמצאים על הלוח",
    isDone: false,
  },
];

// API Route: POST /api/exams
export async function POST(req: Request) {
  try {
    // Reading the data sent from the frontend (all exam properties)
    const body = await req.json();

    await dbConnect();

    // Basic validation for required fields
    const requiredFields = ["courseName", "courseCode"];

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
          message: "כבר קיים מבחן במיקום זה בטווח הזמנים שנבחר.",
        },
        { status: 409 }
      );
    }

    let durationMinutes: number | null = null;

    // Calculate duration if startTime and endTime are provided
    if (body.startTime && body.endTime) {
      const [sh, sm] = body.startTime.split(":").map(Number);
      const [eh, em] = body.endTime.split(":").map(Number);

      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      if (end <= start) {
        return NextResponse.json(
          { success: false, message: "שעת סיום חייבת להיות אחרי שעת התחלה" },
          { status: 400 }
        );
      }

      durationMinutes = end - start;
    }

    // Parsing rules
    const rules = [
      {
        id: "calculator",
        label: "מחשבון",
        icon: "calculator",
        allowed: !!body.rules?.calculator,
      },
      {
        id: "computer",
        label: "מחשב",
        icon: "book",
        allowed: !!body.rules?.computer,
      },
      {
        id: "headphones",
        label: "אוזניות",
        icon: "headphones",
        allowed: !!body.rules?.headphones,
      },
      {
        id: "openBook",
        label: "חומר פתוח",
        icon: "book",
        allowed: !!body.rules?.openBook,
      },
    ];

    console.log("durationMinutes =", durationMinutes);

    // Creating the exam in the database
    const exam = await Exam.create({
      courseName: body.courseName,
      courseCode: body.courseCode,

      date: body.date ?? "-",
      startTime: body.startTime ?? "-",
      endTime: body.endTime ?? "-",
      location: body.location ?? "-",

      lecturers: Array.isArray(body.lecturers) ? body.lecturers : [],
      supervisors: Array.isArray(body.supervisors) ? body.supervisors : [],

      durationMinutes,
      checklist,
      rules,

      students: [],

      status: "scheduled",
    });

    return NextResponse.json({ success: true, exam }, { status: 201 });
  } catch (err) {
    console.error("Error creating exam:", err);

    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

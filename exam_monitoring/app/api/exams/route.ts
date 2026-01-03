import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import Exam from "../../models/Exams";
import User from "../../models/Users";

// Normalizes and validates ID numbers (tz)
function normalizeAndValidateIdNumbers(
  input: unknown,
  fieldName: string
): string[] {
  if (!input) return [];

  // Convert input to array of strings
  const arr =
  typeof input === "string"
    ? input.split(",")
    : Array.isArray(input)
    ? input
    : [];
    
  const cleaned = arr.map((id) => id.toString().trim());

  // Validate each ID number (tz) format
  const invalid = cleaned.filter((id) => !/^\d{9}$/.test(id));

  if (invalid.length > 0) {
    throw new Error(
      `שדה ${fieldName} מכיל ת"ז לא חוקית: ${invalid.join(", ")}`
    );
  }

  return cleaned;
}

// Converts an array of ID numbers (tz) to MongoDB ObjectIds
async function resolveUsersByRole(
  idNumbers: string[],
  role: "lecturer" | "supervisor"
) {
  if (!Array.isArray(idNumbers) || idNumbers.length === 0) {
    return [];
  }

  // Validate each ID number
  for (const id of idNumbers) {
    if (!validateIsraeliId(id)) {
      throw new Error(`תעודת זהות לא חוקית: ${id}`);
    }
  }

  // Fetch users from the database matching the given ID numbers and role
  const users = await User.find({
    idNumber: { $in: idNumbers },
    role,
  });

  if (users.length !== idNumbers.length) {
    const foundIds = users.map((u) => u.idNumber);
    const missing = idNumbers.filter((id) => !foundIds.includes(id));

    throw new Error(
      `תעודת זהות לא קיימת או לא משויכת לתפקיד (${role}): ${missing.join(", ")}`
    );
  }

  return users.map((u) => u._id);
}

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

// Default rules for new exams
function validateIsraeliId(id: string): boolean {
  return /^\d{5,9}$/.test(id);
}

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
            message: `חסר את השדה: ${field}`,
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

    // Resolving lecturers and supervisors by their ID numbers
    const lecturersIdNumbers = normalizeAndValidateIdNumbers(
      body.lecturers,
      "מרצים"
    );

    console.log("SUPERVISORS RAW:", body.supervisorsIdNumbers);

    const lecturers = await resolveUsersByRole(lecturersIdNumbers, "lecturer");

    const supervisorsIdNumbers = normalizeAndValidateIdNumbers(
      body.supervisors,
      "משגיחים"
    );

    const supervisors = await resolveUsersByRole(
      supervisorsIdNumbers,
      "supervisor"
    );

    // Creating the exam in the database
    const exam = await Exam.create({
      courseName: body.courseName,
      courseCode: body.courseCode,

      date: body.date ?? "-",
      startTime: body.startTime ?? "-",
      endTime: body.endTime ?? "-",
      location: body.location ?? "-",

      lecturers,
      supervisors,

      durationMinutes,
      checklist,
      rules,

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

import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { dbConnect } from "../../../../lib/db";
import Exam from "../../../../models/Exams";
import { ExamCsvRow } from "@/app/models/ExamCsvRow";
import User from "../../../../models/Users";
import mongoose from "mongoose";

// Default checklist items for new exams
const emptyChecklist = [
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

// Function to calculate duration in minutes between start and end times
function calcDurationMinutes(start?: string, end?: string): number | null {
  if (!start || !end) return null;

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  if (
    Number.isNaN(sh) ||
    Number.isNaN(sm) ||
    Number.isNaN(eh) ||
    Number.isNaN(em)
  ) {
    return null;
  }

  return eh * 60 + em - (sh * 60 + sm);
}

// Functions to normalize date and time formats
function normalizeDate(date?: string): string | null {
  if (!date) return null;

  // מצפה ל־DD/MM/YYYY
  const [d, m, y] = date.split("/");
  if (!d || !m || !y) return null;

  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// Normalize time to HH:MM format
function normalizeTime(time?: string): string | null {
  if (!time) return null;

  const [h, m] = time.split(":");
  if (!h || !m) return null;

  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

// Default rules for new exams
const emptyRules = [
  {
    id: "calculator",
    label: "מחשבון",
    icon: "calculator",
    allowed: false,
  },
  {
    id: "computer",
    label: "מחשב",
    icon: "book",
    allowed: false,
  },
  {
    id: "headphones",
    label: "אוזניות",
    icon: "headphones",
    allowed: false,
  },
  {
    id: "openBook",
    label: "חומר פתוח",
    icon: "book",
    allowed: false,
  },
];

// List of lecturer keys for processing
const lecturerKeys = [
  "lecturer1",
  "lecturer2",
  "lecturer3",
  "lecturer4",
] as const;

type LecturerKey = (typeof lecturerKeys)[number];

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim() !== "";

/**
 * POST /api/exams/upload-csv
 *
 * Uploads a CSV file and creates multiple exams in the database.
 * Parses exam details, lecturers (by ID number), rules, and times.
 *
 * Notes:
 * - Dates are normalized to YYYY-MM-DD
 * - Times are normalized to HH:MM
 * - Lecturers are matched by idNumber
 * - Exams are created with default checklist and status "scheduled"
 */
export async function POST(req: Request) {
  try {
    // Reading the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // if no file is uploaded, return an error response
    if (!file) {
      return NextResponse.json(
        { success: false, message: "קובץ לא נבחר, אנא נסה שנית" },
        { status: 400 }
      );
    }

    // Read file content as text
    const buffer = Buffer.from(await file.arrayBuffer());

    // Remove BOM if present
    const csvText = buffer.toString("utf-8").replace(/^\uFEFF/, "");

    // Parse CSV content to extract exam data
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    await dbConnect();

    const typedRecords = records as ExamCsvRow[];

    const exams = typedRecords.map((row) => {
      const lecturerTzList = lecturerKeys
        .map((k: LecturerKey) => row[k])
        .filter(isNonEmptyString);

      return {
        courseName: row.courseName,
        courseCode: Number(row.courseCode),

        date: normalizeDate(row.date),
        startTime: normalizeTime(row.startTime),
        endTime: normalizeTime(row.endTime),

        location: row.location ?? null,

        lecturersTz: lecturerTzList,

        supervisors: [],

        durationMinutes: calcDurationMinutes(row.startTime, row.endTime),

        checklist: emptyChecklist,

        rules: [
          {
            id: "calculator",
            label: "מחשבון",
            icon: "calculator",
            allowed: row.calculator === "1",
          },
          {
            id: "book",
            label: "חומר פתוח",
            icon: "book",
            allowed: row.book === "1",
          },
          {
            id: "phone",
            label: "טלפון",
            icon: "phone",
            allowed: row.phone === "1",
          },
          {
            id: "headphones",
            label: "אוזניות",
            icon: "headphones",
            allowed: row.headphones === "1",
          },
        ],

        students: [],
        status: "scheduled",
      };
    });

    // Collect all unique lecturer Tz from the exams
    const allLecturerTz = exams.flatMap((e) => e.lecturersTz);

    // Fetch lecturer users from the database
    const lecturerUsers = await User.find({
      idNumber: { $in: allLecturerTz },
      role: "lecturer",
    }).select("_id idNumber");

    // Create a map from Tz to ObjectId for quick lookup
    const tzToObjectId = new Map(lecturerUsers.map((u) => [u.idNumber, u._id]));

    // Prepare exams for insertion, mapping lecturer Tz to ObjectIds
    const examsForInsert = exams.map((e) => ({
      courseName: e.courseName,
      courseCode: e.courseCode,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      durationMinutes: e.durationMinutes,
      checklist: e.checklist,
      rules: e.rules,
      students: [],
      status: "scheduled",

      lecturers: e.lecturersTz
        .map((tz) => tzToObjectId.get(tz))
        .filter((id): id is mongoose.Types.ObjectId => Boolean(id)),

      supervisors: [],
    }));

    // Insert exams into the database
    await Exam.insertMany(examsForInsert, { ordered: false });

    // Return success response with count of inserted exams
    return NextResponse.json({
      success: true,
      inserted: exams.length,
    });
  } catch (err: unknown) {
    console.error("CSV upload error FULL:", err);

    return NextResponse.json(
      { success: false, message: "Failed to process CSV" },
      { status: 500 }
    );
  }
}

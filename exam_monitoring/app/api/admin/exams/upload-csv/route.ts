import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { dbConnect } from "../../../../lib/db";
import Exam from "../../../../models/Exams";
import { ExamCsvRow } from "@/app/models/ExamCsvRow";

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

// API route to handle CSV file upload and process exam data
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

    // Map parsed records to Exam model format
    const exams = (records as ExamCsvRow[]).map((row) => ({
      courseName: row.courseName,
      courseCode: row.courseCode,

      date: null,
      startTime: null,
      endTime: null,
      location: null,

      lecturers: [],
      supervisors: [],

      durationMinutes: null,
      checklist: emptyChecklist,
      rules: emptyRules,

      students: [],

      status: "scheduled",
    }));

    // Insert exams into the database
    await Exam.insertMany(exams, { ordered: false });

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
  
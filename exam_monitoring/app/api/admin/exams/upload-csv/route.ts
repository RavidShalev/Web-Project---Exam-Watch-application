import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { dbConnect } from "../../../../lib/db";
import Exam from "../../../../models/Exams";
import { ExamCsvRow } from "@/app/models/ExamCsvRow";

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

      lecturers: [],
      supervisors: [],

      checklist: [],
      rules: [],

      date: "-",
      startTime: "-",
      endTime: "-",
      location: "-",

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

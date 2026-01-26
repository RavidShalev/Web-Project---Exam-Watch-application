import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

// ✅ builds a Date object from date and time strings (safer than ISO string parsing)
function buildExamDateAndTime(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour-2, minute, 0);
}

// checks if two dates are on the same calendar day (server local time)
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// API Route: GET /api/exams/closest?supervisorId=...
export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const supervisorId = searchParams.get("supervisorId");

    if (!supervisorId) {
      return NextResponse.json(
        { message: "Missing supervisorId parameter" },
        { status: 400 }
      );
    }

    // 1) Active exam always wins (no time checks)
    const activeExam = await Exam.findOne({
      supervisors: supervisorId,
      status: "active",
    }).lean();

    if (activeExam) {
      return NextResponse.json({ closestExam: activeExam });
    }

    // 2) Scheduled exams for this supervisor
    const exams = await Exam.find({
      supervisors: supervisorId,
      status: "scheduled",
    }).lean();

    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    
    console.log("NOW(local):", now.toString(), "| NOW(ISO):", now.toISOString());
    console.log("Scheduled exams found:", exams.length);

    const examsWithDate = exams.map((exam: any) => ({
      ...exam,
      examDateTime: buildExamDateAndTime(exam.date, exam.startTime),
    }));

    // Only exams from TODAY
    const todayExams = examsWithDate.filter((exam: any) =>
      isSameDay(exam.examDateTime, now)
    );

    // Only exams in ±30 minutes window
    const examInTimeWindow = todayExams.find((exam: any) => {
      const diffMinutes = (exam.examDateTime.getTime() - now.getTime()) / 60000;

      console.log(
        "Checking exam:",
        exam.courseName,
        "| examDateTime(local):",
        exam.examDateTime.toString(),
        "| diffMinutes:",
        Math.round(diffMinutes)
      );

      return Math.abs(diffMinutes) <= 30;
    });

    if (examInTimeWindow) {
      return NextResponse.json({ closestExam: examInTimeWindow });
    }

    return NextResponse.json({ closestExam: null });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}

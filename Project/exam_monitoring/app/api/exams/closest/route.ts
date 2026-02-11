import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";
import { fromZonedTime  } from "date-fns-tz";

//build exam datetime in UTC from Israel local time
function buildExamDateAndTime(date: string, time: string): Date {
  const localDateTime = `${date} ${time}:00`;
  return fromZonedTime(localDateTime, "Asia/Jerusalem");
}

// checks if two dates are on the same calendar day in Israel time
function isSameDayInIsrael(d1: Date, d2: Date): boolean {
  const tz = "Asia/Jerusalem";

  const d1Local = new Date(
    d1.toLocaleString("en-US", { timeZone: tz })
  );
  const d2Local = new Date(
    d2.toLocaleString("en-US", { timeZone: tz })
  );

  return (
    d1Local.getFullYear() === d2Local.getFullYear() &&
    d1Local.getMonth() === d2Local.getMonth() &&
    d1Local.getDate() === d2Local.getDate()
  );
}

/**
 * GET /api/exams/closest?supervisorId=...
 * Returns the active exam for a supervisor, or the closest scheduled exam
 * today within a ±30 minute window (Israel time).
 */
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

    // Active exam always wins
    const activeExam = await Exam.findOne({
      supervisors: supervisorId,
      status: "active",
    }).lean();

    if (activeExam) {
      return NextResponse.json({ closestExam: activeExam });
    }

    // Scheduled exams for this supervisor
    const exams = await Exam.find({
      supervisors: supervisorId,
      status: "scheduled",
    }).lean();

    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;


    const examsWithDate = exams.map((exam: any) => ({
      ...exam,
      examDateTime: buildExamDateAndTime(exam.date, exam.startTime),
    }));

    // Only exams from TODAY (Israel time)
    const todayExams = examsWithDate.filter((exam: any) =>
      isSameDayInIsrael(exam.examDateTime, now)
    );

    // Only exams in ±30 minutes window
    const examInTimeWindow = todayExams.find((exam: any) => {
      const diffMinutes =
        (exam.examDateTime.getTime() - now.getTime()) / 60000;

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

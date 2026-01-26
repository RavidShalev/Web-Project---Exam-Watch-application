import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

// builds a Date object from date and time strings
function buildExamDateAndTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
}

// checks if two dates are on the same calendar day
function isSameDay(d1: Date, d2: Date): boolean {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

// API Route: GET /api/exams/closest
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

        // active exam always wins
        const activeExam = await Exam.findOne({
            supervisors: supervisorId,
            status: "active",
        }).lean();

        if (activeExam) {
            return NextResponse.json({ closestExam: activeExam });
        }

        // scheduled exams for this supervisor
        const exams = await Exam.find({
            supervisors: supervisorId,
            status: "scheduled",
        }).lean();

        const now = new Date();
        const THIRTY_MINUTES = 30 * 60 * 1000;

        const examsWithDate = exams.map((exam) => {
            const examDateTime = buildExamDateAndTime(exam.date, exam.startTime);
            return { ...exam, examDateTime };
        });

        // only exams from TODAY
        const todayExams = examsWithDate.filter((exam) =>
            isSameDay(exam.examDateTime, now)
        );

        // only exams in ±30 minutes window
        const examInTimeWindow = todayExams.find((exam) => {
            const diff = exam.examDateTime.getTime() - now.getTime();
            return Math.abs(diff) <= THIRTY_MINUTES;
        });

        if (examInTimeWindow) {
            return NextResponse.json({ closestExam: examInTimeWindow });
        }

        // nothing relevant right now
        return NextResponse.json({ closestExam: null });
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : "Unknown server error" },
            { status: 500 }
        );
    }
}

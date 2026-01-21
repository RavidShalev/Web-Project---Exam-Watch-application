import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";

// builds a Date object from date and time strings
function buildExamDateAndTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00`);
}

// API Route: GET /api/exams/closest
export async function GET(req: Request) {
    try {
        // connect to the database, if already connected, does nothing
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const supervisorId = searchParams.get("supervisorId");
        // if no supervisorId provided, return error 400
        if (!supervisorId) {
            return NextResponse.json(
                { message: "Missing supervisorId parameter" },
                { status: 400 }
            );
        }

        // first check if there is any active exam for the supervisor
        const activeExam = await Exam.find({
            supervisors: supervisorId,
            status: { $in: ["active"] },
        }).lean();
        if (activeExam.length > 0) {
            return NextResponse.json({ closestExam: activeExam[0] });
        }

        // find all exams where the supervisor is assigned and the exam is scheduled
        const exams = await Exam.find({
            supervisors: supervisorId,
            status: { $in: ["scheduled"] },
        }).lean();

        const now = new Date();
        const THIRTY_MINUTES = 30 * 60 * 1000;

        const examsWithDate = exams.map((exam) => ({
            ...exam,
            examDateTime: buildExamDateAndTime(exam.date, exam.startTime),
        }));

        const examInTimeWindow = examsWithDate.find((exam) => {
            const examTime = exam.examDateTime.getTime();
            const nowTime = now.getTime();

            return (
                nowTime >= examTime - THIRTY_MINUTES &&
                nowTime <= examTime + THIRTY_MINUTES
            );
        });

        if (examInTimeWindow) {
            return NextResponse.json({ closestExam: examInTimeWindow });
        }

        const upcomingExams = examsWithDate
            // filter only exams that are in the future, in case there is any exam with status 
            // "scheduled" but date already passed
            .filter((exam) => exam.examDateTime > now)
            .sort((a, b) => a.examDateTime.getTime() - b.examDateTime.getTime());

        // return the closest exam or null if none found
        const closestExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

        return NextResponse.json({ closestExam });
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : "Unknown server error" },
            { status: 500 }
        );
    }
}

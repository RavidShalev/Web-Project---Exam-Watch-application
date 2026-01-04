import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";
import Attendance from "../../../models/Attendance";

export async function POST(req: Request) {
    try {
        // connect to the database, if already connected, does nothing
        await dbConnect();

        // get examId from request body
        const { examId } = await req.json();

        // if no examId provided, return error
        if (!examId) {
            return NextResponse.json(
                { message: "Missing examId in request body" },
                { status: 400 }
            );
        }
        // update the exam status to "active" and set actualStartTime to now 
        const exam = await Exam.findOneAndUpdate(
            { _id: examId, status: "scheduled" },
            { status: "active", actualStartTime: new Date().toISOString() },
            { new: true }
        );

        // if no exam found, return error
        if (!exam) {
            return NextResponse.json(
                { error: "Exam not found" },
                { status: 404 }
            );
        }

        const existingAttendance = await Attendance.findOne({ examId: exam._id });
        if (!existingAttendance) {
        // prepare attendance records for each student in the exam
        const attendanceRecords = exam.students.map((studentId: any, index: number) => ({
            examId: exam._id,
            studentId: studentId,
            studentNumInExam: index + 1,
            attendanceStatus: "absent",
            IdImage: null,
            isOnToilet: false,
            }));

        await Attendance.insertMany(attendanceRecords);

        }

        // return success response
        return NextResponse.json({ message: "Exam activated successfully", exam });
    } catch (err) {
        console.error("Error activating exam:", err);
        return NextResponse.json(
            { message: err instanceof Error ? err.message : "Unknown server error" },
            { status: 500 }
        );
    }
}
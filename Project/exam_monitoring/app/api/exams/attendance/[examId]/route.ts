import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Attendance from "@/app/models/Attendance";

/**
 * GET /api/exams/[examId]/attendance
 * Returns attendance records for a specific exam,
 * including populated student details (name and ID number).
 */
export async function GET(
    req: Request,
    {params}: {params: Promise<{examId: string}>}
) {
    try {
        // connect to the database, if already connected, does nothing
        await dbConnect();

        // Find attendance records for the specified exam
        const attendance=await Attendance.find({examId:(await params).examId}).populate("studentId", "idNumber name");

        return NextResponse.json(attendance);
    } catch (error) {
        console.error("GET attendance error:", error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }
}
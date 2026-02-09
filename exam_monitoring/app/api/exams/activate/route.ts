import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";
import Attendance from "../../../models/Attendance";
import { logAuditEvent, logAuditAction } from "../../../lib/auditLogger";

/**
 * POST /api/exams/activate
 * Activates a scheduled exam:
 * - Sets exam status to "active"
 * - Stores actual start time
 * - Initializes attendance records for all students
 * - Writes audit logs (exam started)
 */
export async function POST(req: Request) {
    try {
        // connect to the database, if already connected, does nothing
        await dbConnect();

        // get examId and userId from request body
        const { examId, userId } = await req.json();

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
            await logAuditEvent({
                userId: userId,
                action: "התחלת מבחן",
                examId,
                status: false,
            });
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
        await logAuditEvent({userId, action: "התחלת מבחן", examId: exam._id.toString(), status: true,});
        
        // ✅ Log important action to audit log for admin dashboard
        await logAuditAction({
            actionType: 'EXAM_STARTED',
            description: `מבחן "${exam.courseName}" התחיל`,
            userId,
            examId: exam._id.toString(),
            metadata: {
                courseName: exam.courseName,
                location: exam.location,
                startTime: exam.actualStartTime,
            }
        });

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
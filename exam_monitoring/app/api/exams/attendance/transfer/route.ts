import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Attendance from "@/app/models/Attendance";
import Exam from "../../../../models/Exams";
import User from "../../../../models/Users";
import { logAuditEvent, logAuditAction } from "../../../../lib/auditLogger";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { attendanceId, targetExamId, userId } = body;

    if (!attendanceId || !targetExamId || !userId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // find the original (the record in this class) record
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return NextResponse.json(
        { message: "Attendance record not found" },
        { status: 404 }
      );
    }

    // check again the targetExam
    const targetExam = await Exam.findById(targetExamId);

    if (!targetExam || targetExam.status !== "active") {
      return NextResponse.json(
        { message: "Target exam is not active or not found" },
        { status: 400 }
      );
    }

    // if he already in this class
    if (attendance.examId.toString() === targetExamId) {
      return NextResponse.json(
        { message: "Student is already in this exam" },
        { status: 400 }
      );
    }

    // edit the old record
    attendance.attendanceStatus = "transferred";
    attendance.transferredAt = new Date();
    attendance.transferredToExamId = targetExam._id;

    await attendance.save();

    // count the number of student in order to calcualate the number of student in the exam class
    const count = await Attendance.countDocuments({ targetExam });
    
        // create a new attendance record
    const newAttendance = await Attendance.create({
          examId: targetExam._id,
          studentId: attendance.studentId,
          studentNumInExam: count + 1,
          attendanceStatus: "absent",
          IdImage: null,
          isOnToilet: false,
          extraTimeMinutes: 0,
          transferredFromAttendanceId: attendance._id,
    });

    const populatedAttendance = await Attendance.findById(newAttendance._id).populate("studentId", "name idNumber");

    // add to action log
    await logAuditEvent({
      userId,
      action: "העברת סטודנט בין כיתות",
      examId: attendance.examId.toString(),
      status: true,
    });

    await logAuditAction({
      actionType: "STUDENT_TRANSFERRED",
      description: `סטודנט הועבר מכיתה ${attendance.examId} לכיתה ${targetExam.location}`,
      userId,
      examId: targetExam._id.toString(),
      metadata: {
        fromExamId: attendance.examId,
        toExamId: targetExam._id,
        location: targetExam.location,
      },
    });

    return NextResponse.json({
      message: "Student transferred successfully",
      newAttendance,
    });
  } catch (err) {
    console.error("Transfer error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

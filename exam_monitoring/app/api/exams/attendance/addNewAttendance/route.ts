import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Attendance from "@/app/models/Attendance";
import Exam from "../../../../models/Exams";
import User from "../../../../models/Users";
import { logAuditEvent, logAuditAction } from "../../../../lib/auditLogger";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const { examId, studentIdNumber, userId } = await req.json();

    if (!examId || !studentIdNumber) {
      return NextResponse.json(
        { message: "Missing examId or studentIdNumber" },
        { status: 400 }
      );
    }

    // find the exam
    const exam = await Exam.findById(examId);
    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    // find the student according to the ID number
    const student = await User.findOne({ idNumber: studentIdNumber });
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // check the student not exists in the list of the exam
    const existing = await Attendance.findOne({
      examId,
      studentId: student._id,
    });

    if (existing) {
      return NextResponse.json(
        { message: "Student already exists in attendance list" },
        { status: 409 }
      );
    }

    // count the number of student in order to calcualate the number of student in the exam class
    const count = await Attendance.countDocuments({ examId });

    // create a new attendance record
    const attendance = await Attendance.create({
      examId,
      studentId: student._id,
      studentNumInExam: count + 1,
      attendanceStatus: "absent",
      IdImage: null,
      isOnToilet: false,
      extraTimeMinutes: 0,
    });

    // create a new action log
    await logAuditEvent({
      userId,
      action: "הוספת סטודנט למבחן",
      examId,
      status: true,
    });

    // replace studentId ObjectId with the student's name and ID number
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate("studentId", "name idNumber");

    return NextResponse.json({
      message: "Student added successfully",
      attendance: populatedAttendance,
    });
  } catch (err) {
    console.error("Error adding student:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

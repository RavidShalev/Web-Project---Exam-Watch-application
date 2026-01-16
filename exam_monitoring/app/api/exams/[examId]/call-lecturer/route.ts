import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Exam from "../../../../models/Exams";
import User from "../../../../models/Users";
import mongoose from "mongoose";
import { logAuditEvent } from "../../../../lib/auditLogger";

// API Route: POST /api/exams/[examId]/call-lecturer
// Marks a lecturer as called/assigned to the classroom
export async function POST(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const cleanExamId = String(examId).trim();

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(cleanExamId)) {
      return NextResponse.json(
        { message: "Invalid exam id" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Read the request body
    const body = await req.json();
    const { lecturerId, supervisorId } = body;

    if (!lecturerId) {
      return NextResponse.json(
        { message: "Lecturer ID is required" },
        { status: 400 }
      );
    }

    // Validate lecturerId format
    if (!mongoose.Types.ObjectId.isValid(lecturerId)) {
      return NextResponse.json(
        { message: "Invalid lecturer id" },
        { status: 400 }
      );
    }

    // Verify the lecturer exists and has the correct role
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== "lecturer") {
      return NextResponse.json(
        { message: "Lecturer not found or invalid role" },
        { status: 400 }
      );
    }

    // Fetch the exam
    const exam = await Exam.findById(cleanExamId)
      .populate("lecturers", "idNumber name");
    
    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    // Verify the lecturer is assigned to this exam
    const lecturerIds = exam.lecturers.map((l: any) => 
      typeof l === 'string' ? l : l._id.toString()
    );
    
    if (!lecturerIds.includes(lecturerId)) {
      return NextResponse.json(
        { message: "This lecturer is not assigned to this exam" },
        { status: 400 }
      );
    }

    // Update the exam to mark the lecturer as called
    const updatedExam = await Exam.findByIdAndUpdate(
      cleanExamId,
      {
        calledLecturer: lecturerId,
        lecturerCalledAt: new Date(),
      },
      { new: true }
    )
      .populate("calledLecturer", "idNumber name")
      .populate("lecturers", "idNumber name")
      .populate("supervisors", "idNumber name");

    // Log audit event if supervisorId is provided
    if (supervisorId) {
      await logAuditEvent({
        userId: supervisorId,
        action: "קריאה למרצה",
        examId: cleanExamId,
        status: true,
      });
    }

    return NextResponse.json({
      success: true,
      exam: updatedExam,
      message: `המרצה ${lecturer.name} נקרא בהצלחה לכיתה ${exam.location}`,
    });
  } catch (error) {
    console.error("Error calling lecturer:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

// API Route: DELETE /api/exams/[examId]/call-lecturer
// Removes the lecturer call (allows lecturer to dismiss or supervisor to cancel)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const cleanExamId = String(examId).trim();

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(cleanExamId)) {
      return NextResponse.json(
        { message: "Invalid exam id" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Read the request body (optional - might contain userId for logging)
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    // Fetch the exam
    const exam = await Exam.findById(cleanExamId);
    
    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found" },
        { status: 404 }
      );
    }

    // Clear the called lecturer
    const updatedExam = await Exam.findByIdAndUpdate(
      cleanExamId,
      {
        calledLecturer: null,
        lecturerCalledAt: null,
      },
      { new: true }
    )
      .populate("calledLecturer", "idNumber name")
      .populate("lecturers", "idNumber name")
      .populate("supervisors", "idNumber name");

    // Log audit event if userId is provided
    if (userId) {
      await logAuditEvent({
        userId,
        action: "ביטול קריאה למרצה",
        examId: cleanExamId,
        status: true,
      });
    }

    return NextResponse.json({
      success: true,
      exam: updatedExam,
      message: "הקריאה למרצה בוטלה בהצלחה",
    });
  } catch (error) {
    console.error("Error canceling lecturer call:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

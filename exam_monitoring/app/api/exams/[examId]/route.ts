import { NextResponse } from "next/server";
import dbConnect from "../../../lib/db";
import Exam from "../../../models/Exams";
import User from "../../../models/Users";
import mongoose from "mongoose";
import {logAuditEvent} from "../../../lib/auditLogger";

/**
 * GET    /api/exams/[examId]   - Get full exam details (with lecturers, supervisors, students)
 * PUT    /api/exams/[examId]   - Update exam details and assignments
 * DELETE /api/exams/[examId]   - Delete an exam
 * PATCH  /api/exams/[examId]   - Mark exam as finished
 *
 * Includes validation, role-based user mapping, and audit logging.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    await dbConnect();

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ message: "Invalid exam id" }, { status: 400 });
    }

    // Fetch the exam by ID
    const exam = await Exam.findById(examId)
      .populate("lecturers", "idNumber name")
      .populate("supervisors", "idNumber name")
      .populate("students", "idNumber name")
      .populate("calledLecturer", "idNumber name");

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    // Return the exam in the response
    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error("GET exam error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Delete exam by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    await dbConnect();

    // Validate examId format
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ message: "Invalid exam id" }, { status: 400 });
    }

    // Delete the exam
    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE exam error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Update exam by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const cleanExamId = String(examId).trim();

    //  Validate examId format
    if (!mongoose.Types.ObjectId.isValid(cleanExamId)) {
      return NextResponse.json({ message: "Invalid exam id" }, { status: 400 });
    }

    await dbConnect();

    // Read the data sent from the frontend
    const payload = await req.json();
    const {
      courseName,
      courseCode,
      date,
      startTime,
      endTime,
      location,
      supervisorsTz,
      lecturersTz,
      rules,
    } = payload;

    if (!courseName || !courseCode) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch existing exam
    const existingExam = await Exam.findById(cleanExamId);
    if (!existingExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    // Merge existing rules with updated rules
    const mergedRules = existingExam.rules.map(
      (rule: {
        id: string;
        label: string;
        icon: string;
        allowed: boolean;
      }) => ({
        ...rule,
        allowed: Boolean(rules?.[rule.id]),
      })
    );

    // Check for scheduling conflicts if date, time, or location changed
    const supervisorUsers = Array.isArray(supervisorsTz)
      ? await User.find({
          idNumber: { $in: supervisorsTz },
          role: "supervisor",
        })
      : [];

    // Find lecturer users
    const lecturerUsers = Array.isArray(lecturersTz)
      ? await User.find({
          idNumber: { $in: lecturersTz },
          role: "lecturer",
        })
      : [];

    if (
      Array.isArray(supervisorsTz) &&
      supervisorsTz.length !== supervisorUsers.length
    ) {
      return NextResponse.json(
        { message: "אחד או יותר משגיחים לא נמצאו או שאין להם את התפקיד הנכון" },
        { status: 400 }
      );
    }

    if (
      Array.isArray(lecturersTz) &&
      lecturersTz.length !== lecturerUsers.length
    ) {
      return NextResponse.json(
        { message: "אחד או יותר מרצים לא נמצאו או שאין להם את התפקיד הנכון" },
        { status: 400 }
      );
    }

    // Update the exam
    const updatedExam = await Exam.findByIdAndUpdate(
      cleanExamId,
      {
        courseName,
        courseCode,
        date,
        startTime,
        endTime,
        location,
        rules: mergedRules,
        supervisors: supervisorUsers.map((u) => u._id),
        lecturers: lecturerUsers.map((u) => u._id),
      },
      { new: true }
    );

    return NextResponse.json({ success: true, exam: updatedExam });
  } catch (error) {
    console.error("PUT exam error FULL:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const {userId}= await req.json();
    await dbConnect();

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      {
        status: "finished",
      },
      { new: true }
    );

    await logAuditEvent({userId, action: "סיום בחינה", examId: examId.toString(), status: true,});
    
    // ✅ Log important action to audit log for admin dashboard
    const { logAuditAction } = await import("../../../lib/auditLogger");
    await logAuditAction({
        actionType: 'EXAM_FINISHED',
        description: `מבחן "${updatedExam.courseName}" הסתיים`,
        examId: examId.toString(),
        metadata: {
            courseName: updatedExam.courseName,
            duration: updatedExam.durationMinutes,
        }
    });

    return NextResponse.json({ success: true, exam: updatedExam });
  } catch (error) {
    console.error("PATCH finish exam error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

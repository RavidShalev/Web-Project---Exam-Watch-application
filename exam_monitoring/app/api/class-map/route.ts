import { NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import Exam from "../../models/Exams";

/* ========= TYPES ========= */

type PopulatedUser = {
  _id: string;
  name: string;
};

type ExamWithRelations = {
  _id: string;
  location: string;
  courseName: string;
  date: string;
  supervisors: PopulatedUser[];
  lecturers: PopulatedUser[];
  calledLecturer?: PopulatedUser | null;
};

type ClassroomDTO = {
  id: string;
  name: string;
  location: string;
  courseName: string;
  examDate: string;
  supervisors: string[];
  calledLecturer?: string | null;
};


export async function GET(req: Request) {
  await dbConnect();

  const role = req.headers.get("x-user-role");
  const userId = req.headers.get("x-user-id");

  // Fetch exams with populated relations
  const exams = (await Exam.find()
    .populate("supervisors", "name")
    .populate("lecturers", "name")
    .populate("calledLecturer", "name")
    .lean()) as ExamWithRelations[];

  // Filter exams to only include upcoming ones
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filteredExams = exams.filter((exam) => {
    const examDate = new Date(exam.date);
    examDate.setHours(0, 0, 0, 0);
    return examDate >= today;
  });

  // Role-based filtering
  if (role === "supervisor" && userId) {
    filteredExams = filteredExams.filter((exam) =>
      exam.supervisors.some((s) => s._id.toString() === userId)
    );
  }

  if (role === "lecturer" && userId) {
    filteredExams = filteredExams.filter((exam) =>
      exam.lecturers.some((l) => l._id.toString() === userId)
    );
  }

  // Map to ClassroomDTO
  const classrooms: ClassroomDTO[] = filteredExams.map((exam) => ({
    id: exam._id.toString(),
    name: `כיתה ${exam.location}`,
    location: exam.location,
    courseName: exam.courseName,
    examDate: exam.date,
    supervisors: exam.supervisors.map((s) => s.name),
    calledLecturer: exam.calledLecturer?.name || null,
  }));

  return NextResponse.json(classrooms);
}

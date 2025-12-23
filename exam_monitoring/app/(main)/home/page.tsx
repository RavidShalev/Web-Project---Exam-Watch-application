"use client";

import { Exam } from '@/types/Exam';
import ReadyForExams from "./_components/ReadyForExams";

export const mockExam: Exam = {
  _id: "exam-001",
  courseName: "מבוא למדעי המחשב",
  courseCode: "CS101",
  lecturers: [
    {
      id: "lec-1",
      name: "ד\"ר יוסי כהן",
      email: "yossi.cohen@college.ac.il",
      phone: "050-1234567",
    },
    {
      id: "lec-2",
      name: "ד\"ר מיכל לוי",
      email: "michal.levy@college.ac.il",
      phone: "052-7654321",
    },
  ],
  date: "2025-02-15",
  startTime: "09:00",
  endTime: "12:00",
  location: "בניין מדעים – חדר 204",
  checklist: [
    {
      id: "item-1",
      description: "לוודא מרחק 2 כסאות בין הסטודנטים",
      isDone: false,
    },
    {
      id: "item-2",
      description: "לרשום את פרטי המבחן על הלוח",
      isDone: false,
    },
    {
      id: "item-3",
      description: "לוודא שכלל התיקים הקדמת הכיתה",
      isDone: false,
    },
  ],
  rules: [
    {
      id: "rule-1",
      label: "מחשבון מותר",
      icon: "calculator",
      allowed: true,
    },
    {
      id: "rule-2",
      label: "טלפון נייד",
      icon: "phone",
      allowed: false,
    },
    {
      id: "rule-3",
      label: "אוזניות",
      icon: "headphones",
      allowed: false,
    },
    {
      id: "rule-4",
      label: "חומר פתוח",
      icon: "book",
      allowed: false,
    },
  ],
};

export default function HomePage() {
  return <ReadyForExams exam={mockExam} />;
}
import { NextResponse } from "next/server";

const classrooms = [
  {
    id: 1,
    name: "כיתה 204",
    location: "בניין A",
    courseName: "מבוא לאלגוריתמים",
    examDate: "2024-07-25",
    supervisors: ["דנה לוי", "יוסי כהן"],
  },
  {
    id: 2,
    name: "כיתה 305",
    location: "בניין B",
    courseName: "מבני נתונים",
    examDate: "2024-07-25",
    supervisors: ["רון מזרחי"],
  },
  {
    id: 3,
    name: "כיתה 101",
    location: "בניין C",
    courseName: "הנדסת תוכנה",
    examDate: "2024-07-26",
    supervisors: [],
  },
];


export async function GET(req: Request) {
  const role = req.headers.get("x-user-role");

  if (role === "supervisor") {
    return NextResponse.json(
      classrooms.filter((c) =>
        c.supervisors.includes("רון מזרחי")
      )
    );
  }

  if (role === "student") {
    return NextResponse.json([]);
  }

  // admin / lecturer
  return NextResponse.json(classrooms);
}

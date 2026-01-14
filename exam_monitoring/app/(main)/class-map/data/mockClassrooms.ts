export type Classroom = {
  id: number;
  name: string;
  courseName: string;
  examDate: string;
  supervisors: string[];
};

export const mockClassrooms: Classroom[] = [
  {
    id: 1,
    name: "כיתה 204",
    courseName: "מבוא לאלגוריתמים",
    examDate: "2024-07-25",
    supervisors: ["דנה לוי", "יוסי כהן"],
  },
  {
    id: 2,
    name: "כיתה 305",
    courseName: "מבני נתונים",
    examDate: "2024-07-25",
    supervisors: ["רון מזרחי"],
  },
  {
    id: 3,
    name: "כיתה 101",
    courseName: "הנדסת תוכנה",
    examDate: "2024-07-26",
    supervisors: [],
  },
];

export type Classroom = {
  id: string;
  name: string;
  location: string;
  courseName: string;
  examDate: string; 
  supervisors: string[];
};

export const mockClassrooms: Classroom[] = [
  {
    id: "1",
    name: "כיתה L-702",
    location: "L-702",
    courseName: "אלגברה לינארית 1",
    examDate: "2026-02-03",
    supervisors: [],
  },
  {
    id: "2",
    name: "כיתה L-701",
    location: "L-701",
    courseName: "חדו״א 1",
    examDate: "2026-02-03",
    supervisors: [],
  },
  {
    id: "3",
    name: "כיתה M-210",
    location: "M-210",
    courseName: "פיזיקה להנדסת תוכנה",
    examDate: "2026-01-30",
    supervisors: ["נועה לוי", "אור כהן"],
  },
  {
    id: "4",
    name: "כיתה M-201",
    location: "M-201",
    courseName: "חדו״א 2",
    examDate: "2026-02-05",
    supervisors: [],
  },
  {
    id: "5",
    name: "כיתה M-102",
    location: "M-102",
    courseName: "מערכות ספרתיות",
    examDate: "2026-02-04",
    supervisors: [],
  },
  {
    id: "6",
    name: "כיתה M-101",
    location: "M-101",
    courseName: "מבוא למ״ל",
    examDate: "2026-02-04",
    supervisors: [],
  },
];

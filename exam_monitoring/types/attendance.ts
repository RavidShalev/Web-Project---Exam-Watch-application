export type AttendanceRow = {
  _id: string;
  examId: string;
  studentId: 
  {
    _id: string;
    idNumber: string;
    name: string;
  }
  studentNumInExam: number;
  attendanceStatus: "present" | "absent";
  IdImage: string | null;
  isOnToilet: boolean;
};

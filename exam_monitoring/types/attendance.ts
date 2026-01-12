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
  attendanceStatus: "present" | "absent" | "finished";
  IdImage: string | null;
  isOnToilet: boolean;
  startTime: string | null;
  endTime: string | null;
  extraTimeMinutes?: number;
};

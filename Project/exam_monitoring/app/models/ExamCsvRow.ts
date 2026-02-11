export interface ExamCsvRow {
  courseName: string;
  courseCode: string;

  lecturer1?: string;
  lecturer2?: string;
  lecturer3?: string;
  lecturer4?: string;
  lecturer5?: string;

  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;

  calculator?: string;
  book?: string;
  phone?: string;
  headphones?: string;
}

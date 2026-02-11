export type Classroom = {
  id: string;
  name: string;
  location: string;
  courseName: string;
  examDate: string; 
  supervisors: string[];
  calledLecturer?: string | null;
};


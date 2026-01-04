export type IconType = 'calculator' | 'book' | 'phone' | 'headphones';

export interface Rule{
    id: string;
    label: string;
    icon: IconType;
    allowed: boolean;
}

export interface ItemOfChecklist{
    id: string;
    description: string;
    isDone: boolean;
}


export interface User{
    id?: string;
    idNumber: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'supervisor' | 'admin' | 'lecturer'| 'student';
}

export interface Exam{
    _id?: string;
    courseName: string;
    courseCode: string;
    lecturers: string[];
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    supervisors: string[];
    checklist: ItemOfChecklist[];
    rules: Rule[];
    status: 'scheduled' | 'active' | 'completed';
    actualStartTime?: string;
    durationMinutes: number;
}

export type ExamRuleFlags = {
  calculator: boolean;
  computer: boolean;
  headphones: boolean;
  openBook: boolean;
};

export type PopulatedUser = {
  _id: string;
  idNumber: string;
  name: string;
};

export type ExamFromApi = {
  _id: string;
  courseName: string;
  courseCode: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  lecturers: PopulatedUser[];
  supervisors: PopulatedUser[];
  rules: {
    id: string;
    allowed: boolean;
  }[];
};

export type ExamFormData = {
  courseName: string;
  courseCode: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  lecturers: string;   
  supervisors: string; 
  rules: ExamRuleFlags;
};

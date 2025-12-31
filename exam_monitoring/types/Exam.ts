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
    students: string[];
}
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

export interface Lecturer{
    id: string;
    name: string;
    email: string;
    phone: string;
}

export interface Exam{
    _id?: string;
    courseName: string;
    courseCode: string;
    lecturers: Lecturer[];
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    checklist: ItemOfChecklist[];
    rules: Rule[];
}
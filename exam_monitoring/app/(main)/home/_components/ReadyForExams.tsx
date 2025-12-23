"use client";

import { useState } from 'react';
import { Calculator, Book, Smartphone, Headphones, MapPin, CheckCircle, Circle } from 'lucide-react';
import { Exam, IconType } from '@/types/Exam';


// Connect text to actual icon components
const iconMap: Record<IconType, any> = {
  calculator: Calculator,
  book: Book,
  phone: Smartphone,
  headphones: Headphones,
};

export default function ReadyForExams({ exam }: { exam: Exam }) {
    const [checklist, setChecklist] = useState(exam.checklist);

    // change the isDone status of an item in the checklist
    const toggleItem = (id: string) => {
        setChecklist(prevChecklist => 
            prevChecklist.map(item => 
                item.id === id ? { ...item, isDone: !item.isDone } : item
            )
        );
    }
}

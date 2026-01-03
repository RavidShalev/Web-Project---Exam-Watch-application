"use client";

import { useState } from 'react';
import { Calculator, Book, Smartphone, Headphones, MapPin, CheckCircle, Circle } from 'lucide-react';
import { Exam, IconType } from '@/types/examtypes';


// Connect text to actual icon components
const iconMap: Record<IconType, any> = {
  calculator: Calculator,
  book: Book,
  phone: Smartphone,
  headphones: Headphones,
};

type ReadyForExamsProps = {
    exam: Exam;
    onStartExam?: () => void;
}

export default function ReadyForExams({ exam, onStartExam }: ReadyForExamsProps) {
    const [checklist, setChecklist] = useState(exam.checklist);

    // change the isDone status of an item in the checklist
    const toggleItem = (id: string) => {
        setChecklist(prevChecklist => 
            prevChecklist.map(item => 
                item.id === id ? { ...item, isDone: !item.isDone } : item
            )
        );
    }
    
    // return true if all items in the checklist are done, else false
    const allDone = checklist.every(item => item.isDone);

    return (
        // detailed card with exam info
        <div className="flex flex-col gap-6 p-4 w-full bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-4 text-center text-black">איזור מוכנות לקראת המבחן הקרב</h1>
                <span className="flex justify-center items-center gap-2 mb-6 text-gray-700"> ({exam.courseCode}) {exam.courseName}</span>
            </div>
            <div className="flex bg-blue-50 p-3 rounded-full text-blue-600">
                {/* sign of location */}
                <MapPin size={32}></MapPin>
                <span className="mr-2">{exam.location}</span>
            </div> 
            {/* rules of the exam */}
            <div>
                <h3 className="text-lg font-semibold mb-2 text-black">כללי המבחן:</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 justify-center">
                    {/* for each rule checks if allowed and color it in green, if not allowed in red */}
                    {exam.rules.map((rule) => {
                        const IconComponent = iconMap[rule.icon];
                        return (
                            <div
                            key={rule.id}
                            className={`flex flex-col items-center justify-center min-w-[80px] h-20 rounded-xl border-2 ${
                            rule.allowed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                        >
                            <IconComponent size={24} />
                            <span className="text-xs mt-1">{rule.label}</span>
                        </div>
                    );
                })}
                </div>
            </div>
            {/* checklist for the exam */}
            <div>
                <h3 className="text-lg font-semibold mb-2 text-black">צ'ק ליסט:</h3>
                <div className="flex flex-col gap-3 ">
                    {checklist.map((item) => (
                        <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`flex items-center justify-center p-3 rounded-xl border-2 ${
                            item.isDone
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-white border-gray-200 text-gray-700'
                        }`}
                    >
                        {item.isDone ? (
                            <CheckCircle size={24} />
                        ) : (
                            <Circle size={24} />
                        )}
                        <span className="ml-2">{item.description}</span>
                    </button>
                ))}
                </div>
            </div>
            {/* button to start the exam */}
            <button disabled={!allDone} onClick={onStartExam} className={`mt-6 w-full py-3 rounded-xl text-white font-semibold ${allDone ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                התחל מבחן
            </button>
        </div>
        
    );
}

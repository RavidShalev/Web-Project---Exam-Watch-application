"use client";

import { useState } from 'react';
import { Calculator, Book, Smartphone, Headphones, MapPin, CheckCircle, Circle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
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
    const [isStarting, setIsStarting] = useState(false);

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

    const handleStartExam = async () => {
        setIsStarting(true);
        await onStartExam?.();
    };

    // Calculate progress
    const completedCount = checklist.filter(item => item.isDone).length;
    const progressPercent = (completedCount / checklist.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6" dir="rtl">
            <div className="max-w-2xl mx-auto">
                
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#17cf97] to-[#0ea97a] shadow-lg shadow-[#17cf97]/25 mb-4">
                            <Clock size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">מוכנות לבחינה</h1>
                        <p className="text-lg text-gray-600">{exam.courseName}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-mono">
                            {exam.courseCode}
                        </span>
                    </div>
                </div>

                {/* Location Card */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
                    <div className="bg-blue-500 p-3 rounded-xl">
                        <MapPin size={24} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-blue-600 font-medium">מיקום הבחינה</p>
                        <p className="text-lg font-bold text-blue-900">{exam.location}</p>
                    </div>
                </div>

                {/* Rules Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-500" />
                        ציוד מותר בבחינה
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {exam.rules.map((rule) => {
                            const IconComponent = iconMap[rule.icon];
                            return (
                                <div
                                    key={rule.id}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                        rule.allowed 
                                            ? 'bg-green-50 border-green-300 text-green-700' 
                                            : 'bg-red-50 border-red-200 text-red-500'
                                    }`}
                                >
                                    <IconComponent size={28} className="mb-2" />
                                    <span className="text-sm font-medium">{rule.label}</span>
                                    <span className={`text-xs mt-1 font-semibold ${rule.allowed ? 'text-green-600' : 'text-red-500'}`}>
                                        {rule.allowed ? '✓ מותר' : '✗ אסור'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Checklist Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle size={20} className="text-[#17cf97]" />
                            רשימת בדיקה
                        </h3>
                        <span className="text-sm text-gray-500">
                            {completedCount}/{checklist.length} הושלמו
                        </span>
                    </div>

                    {/* Progress Bar : Feedback */}
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-[#17cf97] to-[#0ea97a] transition-all duration-300 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>

                    <div className="space-y-3">
                        {checklist.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right ${
                                    item.isDone
                                        ? 'bg-green-50 border-green-300'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    item.isDone
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'border-gray-300'
                                }`}>
                                    {item.isDone && <CheckCircle size={16} />}
                                </div>
                                <span className={`flex-1 font-medium ${item.isDone ? 'text-green-700' : 'text-gray-700'}`}>
                                    {item.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Start Button */}
                <button 
                    disabled={!allDone || isStarting} 
                    onClick={handleStartExam} 
                    className={`w-full py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                        allDone 
                            ? 'bg-gradient-to-r from-[#17cf97] to-[#0ea97a] text-white shadow-lg shadow-[#17cf97]/30 hover:shadow-xl hover:shadow-[#17cf97]/40 hover:-translate-y-0.5' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isStarting ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            מתחיל בחינה...
                        </>
                    ) : allDone ? (
                        <>
                            <CheckCircle size={24} />
                            התחל בחינה
                        </>
                    ) : (
                        <>
                            <Circle size={24} />
                            השלם את כל הפריטים
                        </>
                    )}
                </button>

                {!allDone && (
                    <p className="text-center text-gray-500 text-sm mt-3">
                        יש להשלים את כל הפריטים ברשימה לפני תחילת הבחינה
                    </p>
                )}
            </div>
        </div>
    );
}

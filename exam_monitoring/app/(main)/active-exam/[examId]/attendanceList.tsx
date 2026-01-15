"use client";

import { AttendanceRow } from "@/types/attendance";
import { useState } from "react";
import ReportModal from "./reportModal";
import AddTimeModal from "./addTimeModal";

type props={
    attendance:AttendanceRow[];
    makePresent: (attendanceId: string) => void;
    makeAbsent: (attendanceId: string) => void;
    saveReport: (data: {examId: string; studentId: string; eventType: string; description?: string}) => Promise<any>;
    updateToiletTime: (attendanceId: string) => void;
    finishExamForStudent: (attendanceId: string) => void;
    addTimeForStudent: (attendanceId:string, minutesToAdd:number)=>void;
}

export default function AttemdanceList({attendance, makePresent, makeAbsent, saveReport, updateToiletTime, finishExamForStudent, addTimeForStudent}: props) {
    const [openReport, setOpenReport] = useState(false);
    const [openAddTime, setOpenAddTime]=useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRow | null>(null);
    const handleAddTime = async (minutesToAdd: number) => {
        if (!selectedRecord) return;
        await addTimeForStudent(selectedRecord._id, minutesToAdd);
    };

    
    return (
        <>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 text-black dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200">
            <thead>
                <tr>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">תעודת זהות</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">שם</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">מספר במבחן</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">סטטוס נוכחות</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">תמונת תעודה מזהה</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">יציאה לשירותים</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">הוספת זמן</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left dark:border-gray-700">דווח</th>
                </tr>
                
                
            </thead>
            <tbody>
                {attendance.map((record) => (
                    <tr key={record._id}>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700">{record.studentId.idNumber}</td>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700">{record.studentId.name}</td>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700">{record.studentNumInExam}</td>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700"> {record.attendanceStatus === "absent" && (<button onClick={() => {const confirmed = window.confirm(
                            "האם הסטודנט אכן נמצא בכיתה?");
                            if (!confirmed) return;
                            makePresent(record._id);}}
                            className="px-3 py-1 text-sm bg-green-500 dark:bg-green-700 text-white rounded hover:bg-green-600 dark:hover:bg-green-800">
                            סמן כנוכח </button>)}


                            {record.attendanceStatus === "present" && !record.endTime && (
                            <>
                            <button onClick={() => makeAbsent(record._id)}
                            className="px-3 py-1 text-sm bg-red-500 dark:bg-red-700 text-white rounded hover:bg-red-600 dark:hover:bg-red-800 mr-2">
                            בטל נוכחות </button>

                            <button onClick={() => finishExamForStudent(record._id)}
                            className="px-3 py-1 text-sm bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-800">
                            סיים מבחן </button>
                            </>  )}         

                            {record.endTime && (<span className="text-green-700 dark:text-green-300 font-semibold">המבחן הסתיים</span>)}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700"></td>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700">{!record.isOnToilet ? (<button disabled={record.attendanceStatus==="absent"} onClick={()=> updateToiletTime(record._id)} className={`px-3 py-1 text-sm text-white rounded ${record.attendanceStatus === "present" ? 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'}`}>🚽</button>):(<button disabled={record.attendanceStatus==="absent"} onClick={()=>updateToiletTime(record._id)} className="px-3 py-1 text-sm bg-green-500 dark:bg-green-700 text-white rounded hover:bg-green-600 dark:hover:bg-green-800">🚽</button>)}</td>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700"><button disabled={record.attendanceStatus=="absent"} onClick={()=>{setSelectedRecord(record); setOpenAddTime(true);}} className={`px-3 py-1 text-sm bg-blue-500 dark:bg-blue-700 text-white rounded ${record.attendanceStatus === "present" ? 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'}`}>הוספת זמן</button></td>
                        <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700"><button disabled={record.attendanceStatus === "absent"}  onClick={() => {setSelectedRecord(record); setOpenReport(true);}} className={`px-3 py-1 text-sm bg-blue-500 dark:bg-blue-700 text-white rounded ${record.attendanceStatus === "present" ? 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'}`}>דווח</button></td>
                    </tr>
                ))}
            </tbody>
            </table>
            </div>
            {/* Report Modal- for specific attendance record */}
            {openReport && selectedRecord && (<ReportModal attendanceRecord={selectedRecord} onClose={() => {setOpenReport(false); setSelectedRecord(null);}} onSave={saveReport} />)}
            {openAddTime && selectedRecord && (<AddTimeModal attendanceRecord={selectedRecord} onClose={()=>{setOpenAddTime(false); setSelectedRecord(null);}} onSave={handleAddTime}/>)}
            </>
        );

}

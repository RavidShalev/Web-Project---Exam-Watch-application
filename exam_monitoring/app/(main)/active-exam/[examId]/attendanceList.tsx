"use client";

import { AttendanceRow } from "@/types/attendance";
import { useState } from "react";
import ReportModal from "./reportModal";

type props={
    attendance:AttendanceRow[];
    makePresent: (attendanceId: string) => void;
    makeAbsent: (attendanceId: string) => void;
    saveReport: (data: {examId: string; studentId: string; eventType: string; description?: string}) => Promise<any>;
    updateToiletTime: (attendanceId: string) => void;
    finishExamForStudent: (attendanceId: string) => void;
}

export default function AttemdanceList({attendance, makePresent, makeAbsent, saveReport, updateToiletTime, finishExamForStudent}: props) {
    const [openReport, setOpenReport] = useState(false);
    const [openAddTime, setOpenAddTime]=useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRow | null>(null);
    
    return (
        <>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 text-black">
            <thead>
                <tr>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">תעודת זהות</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">שם</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">מספר במבחן</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">סטטוס נוכחות</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">תמונת תעודה מזהה</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">יציאה לשירותים</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">הוספת זמן</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">דווח</th>
                </tr>
                
                
            </thead>
            <tbody>
                {attendance.map((record) => (
                    <tr key={record._id}>
                        <td className="py-2 px-4 border-b border-gray-300">{record.studentId.idNumber}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{record.studentId.name}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{record.studentNumInExam}</td>
                        <td className="py-2 px-4 border-b border-gray-300"> {record.attendanceStatus === "absent" && (<button onClick={() => {const confirmed = window.confirm(
                            "האם הסטודנט אכן נמצא בכיתה?");
                            if (!confirmed) return;
                            makePresent(record._id);}}
                            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                            סמן כנוכח </button>)}


                            {record.attendanceStatus === "present" && !record.endTime && (
                            <>
                            <button onClick={() => makeAbsent(record._id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 mr-2">
                            בטל נוכחות </button>

                            <button onClick={() => finishExamForStudent(record._id)}
                            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">
                            סיים מבחן </button>
                            </>  )}         

                            {record.endTime && (<span className="text-green-700 font-semibold">המבחן הסתיים</span>)}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-300"></td>
                        <td className="py-2 px-4 border-b border-gray-300">{!record.isOnToilet ? (<button disabled={record.attendanceStatus==="absent"} onClick={()=> updateToiletTime(record._id)} className={`px-3 py-1 text-sm text-white rounded ${record.attendanceStatus === "present" ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>🚽</button>):(<button disabled={record.attendanceStatus==="absent"} onClick={()=>updateToiletTime(record._id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">🚽</button>)}</td>
                        <td className="py-2 px-4 border-b border-gray-300"><button disabled={record.attendanceStatus=="absent"} onClick={()=>{setSelectedRecord(record); setOpenAddTime(true);}} className={`px-3 py-1 text-sm bg-blue-500 text-white rounded ${record.attendanceStatus === "present" ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>הוספת זמן</button></td>
                        <td className="py-2 px-4 border-b border-gray-300"><button disabled={record.attendanceStatus === "absent"}  onClick={() => {setSelectedRecord(record); setOpenReport(true);}} className={`px-3 py-1 text-sm bg-blue-500 text-white rounded ${record.attendanceStatus === "present" ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>דווח</button></td>
                    </tr>
                ))}
            </tbody>
            </table>
            </div>
            {/* Report Modal- for specific attendance record */}
            {openReport && selectedRecord && (<ReportModal attendanceRecord={selectedRecord} onClose={() => {setOpenReport(false); setSelectedRecord(null);}} onSave={saveReport} />)}
            </>
        );

}

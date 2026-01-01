"use client";

import { AttendanceRow } from "@/types/attendance";

type props={
    attendance:AttendanceRow[];
    makePresent: (attendanceId: string) => void;
    makeAbsent: (attendanceId: string) => void;
}

export default function AttemdanceList({attendance, makePresent, makeAbsent}: props) {
    return (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 text-black">
            <thead>
                <tr>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">תעודת זהות</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">שם</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">מספר במבחן</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">סטטוס נוכחות</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">תמונת תעודה מזהה</th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left">מסמך התאמות</th>
                   
                </tr>
                
                
            </thead>
            <tbody>
                {attendance.map((record) => (
                    <tr key={record._id}>
                        <td className="py-2 px-4 border-b border-gray-300">{record.studentId.idNumber}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{record.studentId.name}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{record.studentNumInExam}</td>
                        <td className="py-2 px-4 border-b border-gray-300">{record.attendanceStatus === "present" ? (<button onClick={() => makeAbsent(record._id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">בטל נוכחות</button>) : (<button onClick={() => makePresent(record._id)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">סמן כנוכח</button>)}</td>
                        <td className="py-2 px-4 border-b border-gray-300"></td>
                        <td className="py-2 px-4 border-b border-gray-300"></td>
                    </tr>
                ))}
            </tbody>
            </table>
            </div>
        );

}

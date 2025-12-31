"use client";

import { useState } from "react";
import { AttendanceRow } from "@/types/attendance";


export default function AttemdanceList({attendance}: {attendance:AttendanceRow[]}) {
    return (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 text-black">
            <thead>
                <tr dir="rtl">
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
                        <td className="py-2 px-4 border-b border-gray-300"></td>
                        <td className="py-2 px-4 border-b border-gray-300"></td>
                        <td className="py-2 px-4 border-b border-gray-300"></td>
                    </tr>
                ))}
            </tbody>
            </table>
            </div>
        );

}
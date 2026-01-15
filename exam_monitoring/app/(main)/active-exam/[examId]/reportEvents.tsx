"use client";

import {useState} from "react";

type props={
    attendanceRecord: any;
    onClose: () => void;
    onSave: (data: {examId: string; eventType: string; description?: string}) => Promise<void>;
}

export default function ReportEvents({attendanceRecord, onClose, onSave}: props) {
    const [eventType, setEventType] = useState("");
    const [description, setDescription] = useState("");
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl text-black ">
                <h1 className="text-black">דיווח אירוע כללי</h1>
            <div className="my-4 space-y-4">
                {/* Event Type Selection */}
                <label className="mb-1 block text-sm font-medium text-gray-700">סוג האירוע</label>
                <select className="w-full border rounded p-2 bg-white text-gray-900 border-gray-300" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    <option>בחר סוג אירוע</option>
                    <option>אזעקה</option>
                    <option>רעש חריג</option>
                    <option>אירוע רפואי</option>
                    <option>אחר</option>
                </select>

                <label className="mb-1 block text-sm font-medium text-gray-700 "> תיאור</label>
                <textarea
                className="w-full border rounded p-2 text-gray-500 bg-white border-gray-300 "
                placeholder="מלא תיאור על האירוע אם יש צורך"
                value={description}
                onChange={(e) => setDescription(e.target.value)}/>
            </div>

                <div className="flex justify-end gap-2">
                    <button className="border px-4 py-2 rounded text-gray-700 border-gray-300 " onClick={onClose}>ביטול</button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={async () => {
                        // Call onSave with the report data, wait until it's done
                        await onSave({
                            examId: attendanceRecord.examId,
                            eventType,
                            description
                        });
                    }}>שליחה</button>
                </div>
            </div>
        </div>
    )
}
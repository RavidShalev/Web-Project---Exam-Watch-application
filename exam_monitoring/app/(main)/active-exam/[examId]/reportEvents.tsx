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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
            <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl text-black dark:text-white">
                <h1 className="text-black dark:text-white">דיווח אירוע כללי</h1>
            <div className="my-4 space-y-4">
                {/* Event Type Selection */}
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">סוג האירוע</label>
                <select className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" value={eventType} onChange={(e) => setEventType(e.target.value)}>
                    <option>בחר סוג אירוע</option>
                    <option>אזעקה</option>
                    <option>רעש חריג</option>
                    <option>אירוע רפואי</option>
                    <option>אחר</option>
                </select>

                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"> תיאור</label>
                <textarea
                className="w-full border rounded p-2 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                placeholder="מלא תיאור על האירוע אם יש צורך"
                value={description}
                onChange={(e) => setDescription(e.target.value)}/>
            </div>

                <div className="flex justify-end gap-2">
                    <button className="border px-4 py-2 rounded text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600" onClick={onClose}>ביטול</button>
                    <button className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded" onClick={async () => {
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
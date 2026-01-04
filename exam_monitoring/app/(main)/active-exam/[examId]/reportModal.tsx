"use client";

import {useState} from "react";

type props={
    attendanceRecord: any;
    onClose: () => void;
    onSave: (data: {examId: string; studentId: string; eventType: string; description?: string}) => Promise<void>;
}

export default function ReportModal({attendanceRecord, onClose, onSave}: props) {
  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");
    return(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-lg p-6 w-[400px] space-y-4">

        <h2 className="text-lg font-semibold">דיווח על סטודנט</h2>

        <div className="text-sm text-gray-600">
          {attendanceRecord.studentId.name} – {attendanceRecord.studentId.idNumber}
        </div>

        {/* Event Type Selection */}
        <select className="w-full border rounded p-2" value={eventType} onChange={(e) => setEventType(e.target.value)}>
          <option>בחר סוג אירוע חריג</option>
          <option>איחור</option>
          <option>עזיבה מוקדמת</option>
          <option>יצא מהכיתה</option>
          <option>חשד להעתקה (תיאור חובה)</option>
          <option>אחר</option>
        </select>

        <textarea
          className="w-full border rounded p-2"
          placeholder="מלא תיאור על האירוע אם יש צורך"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            className="border px-4 py-2 rounded"
            onClick={onClose}
          >
            ביטול
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={async () => {
            // Call onSave with the report data, wait until it's done
            await onSave({
              examId: attendanceRecord.examId,
              studentId: attendanceRecord.studentId._id,
              eventType,
              description,
            });
            onClose();
          }}>
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}

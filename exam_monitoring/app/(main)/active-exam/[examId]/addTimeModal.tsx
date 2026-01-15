"use client";

import {useState} from "react";

type props={
    attendanceRecord: any;
    onClose: () => void;
    onSave: (minuteToAdd: number) => Promise<void>;
}

export default function AddTimeModal({attendanceRecord, onClose, onSave}: props) {
  const [minuteToAdd, setMinuteToAdd] = useState("");
    return(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-black dark:bg-gray-900">
      <div className="bg-white rounded-lg p-6 w-[400px] space-y-4">

        <h2 className="text-lg font-semibold">הוספת זמן לסטודנט</h2>

        <div className="text-sm text-gray-600">
          {attendanceRecord.studentId.name} – {attendanceRecord.studentId.idNumber}
        </div>

        <input type="number" min={1} value={minuteToAdd}
              onChange={(e) => setMinuteToAdd(e.target.value)}
              placeholder="כמה דקות להוסיף?"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />

        <div className="flex justify-end gap-2">
          <button
            className="border px-4 py-2 rounded"
            onClick={onClose}
          >
            ביטול
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={async () => {
              const value = parseInt(minuteToAdd, 10);
              if (isNaN(value) || value <= 0) {
                alert("אנא הזן/י מספר דקות תקין");
                return;
              }

              await onSave(value);
              onClose();
            }}
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}
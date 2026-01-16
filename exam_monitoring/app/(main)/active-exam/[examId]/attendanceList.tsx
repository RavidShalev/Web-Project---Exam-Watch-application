"use client";

import { AttendanceRow } from "@/types/attendance";
import { useState } from "react";
import ReportModal from "./reportModal";
import AddTimeModal from "./addTimeModal";

type props = {
  attendance: AttendanceRow[];
  makePresent: (attendanceId: string) => void;
  makeAbsent: (attendanceId: string) => void;
  saveReport: (data: {
    examId: string;
    studentId: string;
    eventType: string;
    description?: string;
  }) => Promise<any>;
  updateToiletTime: (attendanceId: string) => void;
  finishExamForStudent: (attendanceId: string) => void;
  addTimeForStudent: (attendanceId: string, minutesToAdd: number) => void;
};

export default function AttemdanceList({
  attendance,
  makePresent,
  makeAbsent,
  saveReport,
  updateToiletTime,
  finishExamForStudent,
  addTimeForStudent,
}: props) {
  const [openReport, setOpenReport] = useState(false);
  const [openAddTime, setOpenAddTime] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<AttendanceRow | null>(null);

  const handleAddTime = async (minutesToAdd: number) => {
    if (!selectedRecord) return;
    await addTimeForStudent(selectedRecord._id, minutesToAdd);
  };

  return (
    <>
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)]">
        <table className="min-w-full text-sm text-right">
          <thead className="bg-[var(--surface-hover)] text-[var(--muted)] font-semibold">
            <tr>
              <th className="px-4 py-3">תעודת זהות</th>
              <th className="px-4 py-3">שם</th>
              <th className="px-4 py-3">מספר במבחן</th>
              <th className="px-4 py-3">סטטוס נוכחות</th>
              <th className="px-4 py-3">תמונת תעודה</th>
              <th className="px-4 py-3">שירותים</th>
              <th className="px-4 py-3">הוספת זמן</th>
              <th className="px-4 py-3">דיווח</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {attendance.map(record => (
              <tr
                key={record._id}
                className="transition hover:bg-[var(--surface-hover)]"
              >
                <td className="px-4 py-3 font-mono">
                  {record.studentId.idNumber}
                </td>
                <td className="px-4 py-3 font-medium">
                  {record.studentId.name}
                </td>
                <td className="px-4 py-3">
                  {record.studentNumInExam}
                </td>

                <td className="px-4 py-3 space-y-1">
                  {record.attendanceStatus === "absent" && (
                    <button
                      onClick={() => makePresent(record._id)}
                      className="rounded-lg px-3 py-1 text-xs font-semibold text-white bg-[var(--success)]"
                    >
                      סמן כנוכח
                    </button>
                  )}

                  {record.attendanceStatus === "present" &&
                    !record.endTime && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => makeAbsent(record._id)}
                          className="rounded-lg px-3 py-1 text-xs font-semibold text-white bg-[var(--danger)]"
                        >
                          בטל נוכחות
                        </button>

                        <button
                          onClick={() =>
                            finishExamForStudent(record._id)
                          }
                          className="rounded-lg px-3 py-1 text-xs font-semibold text-white bg-[var(--purple)]"
                        >
                          סיים מבחן
                        </button>
                      </div>
                    )}

                  {record.endTime && (
                    <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold bg-[var(--success-bg)] text-[var(--success)]">
                      המבחן הסתיים
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-[var(--muted)]">—</td>

                <td className="px-4 py-3">
                    <button
                        disabled={
                        record.attendanceStatus === "absent" ||
                        record.attendanceStatus === "finished"
                        }
                        onClick={() => updateToiletTime(record._id)}
                        className={`
                        rounded-lg px-3 py-1 text-xs font-semibold text-white
                        ${
                            record.attendanceStatus === "absent" ||
                            record.attendanceStatus === "finished"
                            ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                            : record.isOnToilet
                            ? "bg-[var(--success)]"
                            : "bg-[var(--info)] hover:brightness-110"
                        }
                        `}
                    >
                        🚽
                    </button>
                    </td>


                <td className="px-4 py-3">
                  <button
                    disabled={record.attendanceStatus === "absent" || record.attendanceStatus ==="finished"}
                    onClick={() => {
                      setSelectedRecord(record);
                      setOpenAddTime(true);
                    }}
                    className="rounded-lg px-3 py-1 text-xs font-semibold text-white bg-[var(--warning)] disabled:bg-[var(--border)]"
                  >
                    הוספת זמן
                  </button>
                </td>

                <td className="px-4 py-3">
                  <button
                    disabled={record.attendanceStatus === "absent"|| record.attendanceStatus ==="finished"}
                    onClick={() => {
                      setSelectedRecord(record);
                      setOpenReport(true);
                    }}
                    className="rounded-lg px-3 py-1 text-xs font-semibold text-white bg-[var(--danger)] disabled:bg-[var(--border)]"
                  >
                    דווח
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="sm:hidden space-y-4">
        {attendance.map(record => (
          <div
            key={record._id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">
                  {record.studentId.name}
                </p>
                <p className="text-xs text-[var(--muted)] font-mono">
                  {record.studentId.idNumber}
                </p>
              </div>
              <span className="text-xs text-[var(--muted)]">
                #{record.studentNumInExam}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {record.attendanceStatus === "absent" && (
                <button
                  onClick={() => makePresent(record._id)}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white bg-[var(--success)]"
                >
                  סמן כנוכח
                </button>
              )}

              {record.attendanceStatus === "present" &&
                !record.endTime && (
                  <>
                    <button
                      onClick={() => makeAbsent(record._id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white bg-[var(--danger)]"
                    >
                      בטל נוכחות
                    </button>
                    <button
                      onClick={() =>
                        finishExamForStudent(record._id)
                      }
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white bg-[var(--purple)]"
                    >
                      סיים מבחן
                    </button>
                  </>
                )}

              {record.endTime && (
                <span className="rounded-full px-3 py-1 text-xs font-semibold bg-[var(--success-bg)] text-[var(--success)]">
                  המבחן הסתיים
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                disabled={record.attendanceStatus === "absent" || record.attendanceStatus ==="finished"}
                onClick={() => updateToiletTime(record._id)}
                className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white bg-[var(--info)] disabled:bg-[var(--border)]"
              >
                🚽 שירותים
              </button>

              <button
                disabled={record.attendanceStatus === "absent" || record.attendanceStatus ==="finished"}
                onClick={() => {
                  setSelectedRecord(record);
                  setOpenAddTime(true);
                }}
                className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white bg-[var(--warning)] disabled:bg-[var(--border)]"
              >
                הוספת זמן
              </button>

              <button
                disabled={record.attendanceStatus === "absent" || record.attendanceStatus ==="finished"}
                onClick={() => {
                  setSelectedRecord(record);
                  setOpenReport(true);
                }}
                className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white bg-[var(--danger)] disabled:bg-[var(--border)]"
              >
                דווח
              </button>
            </div>
          </div>
        ))}
      </div>

      {openReport && selectedRecord && (
        <ReportModal
          attendanceRecord={selectedRecord}
          onClose={() => {
            setOpenReport(false);
            setSelectedRecord(null);
          }}
          onSave={saveReport}
        />
      )}

      {openAddTime && selectedRecord && (
        <AddTimeModal
          attendanceRecord={selectedRecord}
          onClose={() => {
            setOpenAddTime(false);
            setSelectedRecord(null);
          }}
          onSave={handleAddTime}
        />
      )}
    </>
  );
}

type StudentRow = {
  name: string;
  idNumber: string;
};

type Props = {
  students: StudentRow[];
};

/**
 * ExamStudentsTable
 * Presentational component used to display students registered for an exam.
 *
 * Responsibilities:
 * - Display a list of registered students
 * - Render a responsive layout (table for desktop, cards for mobile)
 * - Show an empty state message when no students are registered
 * - Present student name and ID number in a clear and readable format
 */
export default function ExamStudentsTable({ students }: Props) {
  if (students.length === 0) {
    return (
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        אין סטודנטים רשומים
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
        <table className="min-w-full text-sm text-right">
          <caption className="sr-only">רשימת סטודנטים רשומים לבחינה</caption>
          <thead className="bg-[var(--surface-hover)] text-[var(--muted)] font-semibold">
            <tr>
              <th scope="col" className="px-5 py-3">שם הסטודנט</th>
              <th scope="col" className="px-5 py-3">תעודת זהות</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {students.map((s, idx) => (
              <tr
                key={idx}
                className="transition hover:bg-[var(--surface-hover)]"
              >
                <td className="px-5 py-3 font-medium text-[var(--fg)]">
                  {s.name}
                </td>
                <td className="px-5 py-3 font-mono text-[var(--muted)]">
                  {s.idNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="sm:hidden space-y-3">
        {students.map((s, idx) => (
          <div
            key={idx}
            className="
              rounded-2xl
              border border-[var(--border)]
              bg-[var(--surface)]
              px-4 py-3
              transition
              hover:bg-[var(--surface-hover)]
            "
          >
            <p className="font-semibold text-[var(--fg)]">
              {s.name}
            </p>

            <div className="mt-1 text-sm font-mono text-[var(--muted)]">
              {s.idNumber}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Classroom } from "../data/classRoomType";

type Props = {
  classroom: Classroom;
};

const ClassCard = ({ classroom }: Props) => {
  const hasSupervisors = classroom.supervisors.length > 0;

  return (
    <div
      className={`
        border rounded-xl p-5 transition-all
        hover:shadow-md hover:-translate-y-1
        ${
          hasSupervisors
            ? "bg-[var(--surface)] border-[var(--border)]"
            : "bg-red-500/10 border-red-500/40"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-[var(--fg)]">
          {classroom.name}
        </h2>

        <span
          className="
            text-sm px-3 py-1 rounded-full
            bg-[var(--border)]
            text-[var(--fg)]
          "
        >
          {classroom.supervisors.length} משגיחים
        </span>
      </div>

      {/* Course + Date */}
      <div className="text-sm text-[var(--muted)] mb-4 space-y-1">
        <p>
          <span className="font-medium text-[var(--fg)]">קורס:</span>{" "}
          {classroom.courseName}
        </p>
        <p>
          <span className="font-medium text-[var(--fg)]">תאריך:</span>{" "}
          {new Date(classroom.examDate).toLocaleDateString("he-IL")}
        </p>
      </div>

      {/* Supervisors */}
      <div className="mb-3">
        <p className="font-medium mb-1 text-[var(--fg)]">משגיחים:</p>

        {hasSupervisors ? (
          <ul className="list-disc list-inside text-[var(--fg)]">
            {classroom.supervisors.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="font-medium text-red-600">
            אין משגיחים משובצים
          </p>
        )}
      </div>

      {/* Called Lecturer */}
      {classroom.calledLecturer && (
        <div className="border-t border-[var(--border)] pt-3 mt-3">
          <p className="font-medium mb-1 text-[var(--fg)]">מרצה נקרא:</p>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
              {classroom.calledLecturer}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassCard;

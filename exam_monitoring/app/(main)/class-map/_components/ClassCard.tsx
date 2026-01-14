import type { Classroom } from "../data/mockClassrooms";

type Props = {
  classroom: Classroom;
};

const ClassCard = ({ classroom }: Props) => {
  const hasSupervisors = classroom.supervisors.length > 0;

  return (
    <div
      className={`border rounded-lg p-5 bg-white transition-all
        hover:shadow-md hover:-translate-y-1
        ${
          hasSupervisors
            ? "border-gray-200"
            : "border-red-300 bg-red-50"
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">
          {classroom.name}
        </h2>

        <span className="text-sm px-3 py-1 rounded-full bg-gray-100">
          {classroom.supervisors.length} משגיחים
        </span>
      </div>

      {/* Course + Date */}
      <div className="text-sm text-gray-600 mb-4 space-y-1">
        <p>
          <span className="font-medium">קורס:</span>{" "}
          {classroom.courseName}
        </p>
        <p>
          <span className="font-medium">תאריך:</span>{" "}
          {new Date(classroom.examDate).toLocaleDateString("he-IL")}
        </p>
      </div>

      {/* Supervisors */}
      <div>
        <p className="font-medium mb-1">משגיחים:</p>

        {hasSupervisors ? (
          <ul className="list-disc list-inside">
            {classroom.supervisors.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-red-500 font-medium">
            אין משגיחים משובצים
          </p>
        )}
      </div>
    </div>
  );
};

export default ClassCard;

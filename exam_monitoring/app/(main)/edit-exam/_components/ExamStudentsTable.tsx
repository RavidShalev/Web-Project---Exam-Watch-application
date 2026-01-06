type StudentRow = {
  name: string;
  idNumber: string;
};

type Props = {
  students: StudentRow[];
};

export default function ExamStudentsTable({ students }: Props) {
  if (students.length === 0) {
    return <p className="text-center mt-6">אין סטודנטים רשומים</p>;
  }

  return (
    <div className="mt-8 flex justify-center">
      <table className="min-w-[400px] border border-gray-300 text-right">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">שם הסטודנט</th>
            <th className="border px-4 py-2">תעודת זהות</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, idx) => (
            <tr key={idx}>
              <td className="border px-4 py-2">{s.name}</td>
              <td className="border px-4 py-2">{s.idNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EditExamPage({
  params,
}: {
  params: { examId: string };
}) {
  return (
    <div dir="rtl" className="p-10">
      <h1 className="text-2xl font-bold mb-4">עריכת מבחן</h1>

      <p>מזהה מבחן:</p>
      <code>{params.examId}</code>
    </div>
  );
}

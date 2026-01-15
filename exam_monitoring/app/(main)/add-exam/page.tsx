"use client";

import { useState } from "react";
import AddExamForm from "./_components/AddExam";
import UploadExamCsv from "./_components/UploadExamCsv";
import ExamsTable from "./_components/ExamsTable";

export default function AddExamPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <AddExamForm onSuccess={triggerRefresh} />
      <UploadExamCsv onSuccess={triggerRefresh} />
      <ExamsTable refreshKey={refreshKey} />
    </div>
  );
}

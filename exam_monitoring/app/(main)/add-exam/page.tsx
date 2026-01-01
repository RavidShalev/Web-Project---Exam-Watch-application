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
    <div>
      <AddExamForm onSuccess={triggerRefresh} />
      <UploadExamCsv onSuccess={triggerRefresh} />
      <ExamsTable refreshKey={refreshKey} />
    </div>
  );
}

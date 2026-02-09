"use client";

import { useState } from "react";
import AddExamForm from "./_components/AddExam";
import UploadExamCsv from "./_components/UploadExamCsv";
import ExamsTable from "./_components/ExamsTable";


/**
 * AddExamPage
 * Admin page for managing exams in the system.
 *
 * Responsibilities:
 * - Provide an interface for creating a single exam manually
 * - Allow bulk exam creation via CSV upload
 * - Display the list of existing exams
 * - Coordinate data refresh between child components after changes
 */
export default function AddExamPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* ===== Add Exam Form ===== */}
        <section>
          <AddExamForm onSuccess={triggerRefresh} />
        </section>

        {/* ===== Upload Exams CSV ===== */}
        <section>
          <UploadExamCsv onSuccess={triggerRefresh} />
        </section>

        {/* ===== Exams Table ===== */}
        <section>
          <ExamsTable refreshKey={refreshKey} />
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import ClassGrid from "./_components/ClassGrid";
import type { Classroom } from "./data/mockClassrooms";


const ClassMapPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    const user = sessionStorage.getItem("currentUser");
    const role = user ? JSON.parse(user).role : "";

    fetch("/api/class-map", {
      headers: {
        "x-user-role": role,
      },
    })
      .then((res) => res.json())
      .then((data) => setClassrooms(data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">מפת כיתות</h1>
      <ClassGrid classrooms={classrooms} />
    </div>
  );
};

export default ClassMapPage;

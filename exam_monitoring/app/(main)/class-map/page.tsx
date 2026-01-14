"use client";

import { useEffect, useState } from "react";
import ClassGrid from "./_components/ClassGrid";
import type { Classroom } from "./data/mockClassrooms";

const ClassMapPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    // Retrieve user information from session storage
    const rawUser = sessionStorage.getItem("currentUser");

    if (!rawUser) {
      return;
    }

    const parsedUser = JSON.parse(rawUser);

    const role = parsedUser.role;
    const userId = parsedUser._id;

    // Fetch classroom data with user-specific headers
    fetch("/api/class-map", {
      headers: {
        "x-user-role": role,
        "x-user-id": userId,
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

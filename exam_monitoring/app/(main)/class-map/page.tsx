"use client";

import { useEffect, useState } from "react";
import ClassGrid from "./_components/ClassGrid";
import type { Classroom } from "../../../types/classRoomType";


/**
 * ClassMapPage
 * Page component used to display the classroom map for the current user.
 *
 * Responsibilities:
 * - Retrieve the current user information from session storage
 * - Fetch accessible classroom data based on user role and identity
 * - Maintain and manage the classrooms state
 * - Render a visual grid of classrooms using the ClassGrid component
 */
const ClassMapPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    const rawUser = sessionStorage.getItem("currentUser");

    if (!rawUser) {
      return;
    }

    const parsedUser = JSON.parse(rawUser);
    const role = parsedUser.role;
    const userId = parsedUser._id;

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
    <div className="p-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        מפת כיתות
      </h1>

      <ClassGrid classrooms={classrooms} />
    </div>
  );
};

export default ClassMapPage;

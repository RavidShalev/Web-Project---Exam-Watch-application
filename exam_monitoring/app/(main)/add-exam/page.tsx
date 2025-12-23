"use client";

import { useState } from "react";
import "../../globals.css";

export default function AddExamPage() {
  const [formData, setFormData] = useState({
    subjectName: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    proctor: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/exams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    // case 1: conflict - room already taken
    if (res.status === 409) {
      alert(
        "Cannot create exam: the selected location is already occupied during this time range."
      );
      return;
    }

    // case 2: any other server error
    if (!res.ok) {
      alert(data.message || "An unexpected error occurred. Please try again.");
      return;
    }

      alert("Exam created successfully");
    };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Subject Name</label>
        <input
          type="text"
          name="subjectName"
          value={formData.subjectName}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Start Time</label>
        <input
          type="time"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>End Time</label>
        <input
          type="time"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Proctor</label>
        <input
          type="text"
          name="proctor"
          value={formData.proctor}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Create Exam</button>
    </form>
  );
}

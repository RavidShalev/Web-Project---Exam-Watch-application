import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    proctor: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);

import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    enum: ["calculator", "book", "phone", "headphones"],
    required: true,
  },
  allowed: {
    type: Boolean,
    required: true,
  },
});

const ItemOfChecklistSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
});

const ExamSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
    },
    courseCode: {
      type: Number,
      required: true,
    },
    lecturers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    supervisors: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    date: {
      type: String,
      default: "-",
    },
    startTime: {
      type: String,
      default: "-",
    },
    endTime: {
      type: String,
      default: "-",
    },
    durationMinutes: {
      type: Number,
      required: false,
    },
    location: {
      type: String,
      default: "-",
    },
    checklist: {
      type: [ItemOfChecklistSchema],
      default: [],
    },
    rules: {
      type: [RuleSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "finished"],
      default: "scheduled",
    },
    actualStartTime: {
      type: String,
      default: null,
    },
    students: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },   
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);

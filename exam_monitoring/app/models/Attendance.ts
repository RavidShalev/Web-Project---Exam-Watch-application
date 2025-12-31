import mongoose from "mongoose";

const Attendance = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentNumInExam: {
    type: Number,
    required: true,
  },
  attendanceStatus: {
    type: String,
    enum: ['present', 'absent'],
    default: 'absent', 
  },
  IdImage: {
      type: String,
      default: null,
   },
  AdjusmenentImage: {
      type: String,
      default: null,
   },
});

export default mongoose.models.Attendance || mongoose.model("Attendance", Attendance);
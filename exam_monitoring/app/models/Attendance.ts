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
    enum: ['present', 'absent', 'finished', "transferred"],
    default: 'absent', 
  },
  IdImage: {
      type: String,
      default: null,
   },
   isOnToilet:{
      type: Boolean,
      default: false,
   },
   startTime: {
      type: String,
      default: null,
   },
   endTime: {
      type: String,
      default: null,
   },
   extraTimeMinutes: {
      type: Number,
      default: 0
  },
  transferredAt:{
      type:String,
      required: false,
  },
  transferredToExamId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Exam",
    required: false,
  },
  transferredFromAttendanceId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Exam",
    required: false,
  }
});

export default mongoose.models.Attendance || mongoose.model("Attendance", Attendance);
import mongoose from "mongoose";

const Report = new mongoose.Schema({
  examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    eventType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    },
    {
        timestamps: true, 
    }  
);

export default mongoose.models.Report || mongoose.model("Report", Report);
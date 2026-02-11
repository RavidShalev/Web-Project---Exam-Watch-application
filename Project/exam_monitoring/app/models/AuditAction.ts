import mongoose from "mongoose";

const AuditActions= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    action:{
        type: String,
        required: true,
        index: true,
    },
    examId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Exam",
        required: false,
    },
    status:{
        type: Boolean,
        required: true,
        index: true,
    },
},
{
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
}
);

export default mongoose.models.AuditAction || mongoose.model("AuditAction", AuditActions);
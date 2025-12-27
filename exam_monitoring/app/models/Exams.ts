import mongoose from "mongoose";


const RuleSchema = new mongoose.Schema({
  id:
  {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    enum: ["calculator", "book", "phone", "headphones"],
    required: true
  },
  allowed: {
    type: Boolean,
    required: true
  }
});

const ItemOfChecklistSchema = new mongoose.Schema({
  id:
  {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isDone: {
    type: Boolean,
    default: false
  }
});

const ExamSchema = new mongoose.Schema(
  {
    courseName:
    {
      type: String,
      required: true
    },
    courseCode:
    {
      type: String,
      required: true
    },
    lecturers:
    [
      {
        type: String,
        required: true
      }
    ],
    date:
    {
      type: String,
      required: true
    },
    startTime:
    {
      type: String,
      required: true
    },
    endTime:
    {
      type: String,
      required: true
    },
    location:
    {
      type: String,
      required: true
    },
   supervisors:
   [
     {
       type : String,
       required :true
     }
   ],
   checklist :
   [
     ItemOfChecklistSchema
   ],
   rules :
   [
     RuleSchema
   ],
   status :
   {
     type : String,
     enum : ['scheduled', 'active', 'finished'],
     default : 'scheduled'
   }
  },
  {
     timestamps :true
  }
);

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
import mongoose from "mongoose";


const ProcedureSchema = new mongoose.Schema(
  {
    sectionId: { type: String, required: true }, 

    title: { type: String, required: true },
    
    content: { type: String, required: true },

    icon: { type: String, default: "info" }, 
    
    // A list of roles that are allowed to see this procedure
    targetRoles: { 
      type: [String], 
      required: true,
      enum: ["supervisor", "lecturer", "student"] 
    },
      
    phase: { 
      type: String, 
      required: true,
      enum: ["before", "ongoing", "after", "always"],
      default: "always"
    },
    
  },
  
  { timestamps: true }
);

// this is the connect tot DB
export default mongoose.models.Procedure || mongoose.model("Procedure", ProcedureSchema);
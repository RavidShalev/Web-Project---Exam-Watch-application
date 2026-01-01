import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Attendance from "@/app/models/Attendance";


export async function PATCH(
    req: Request,
    {params}: {params: Promise<{attendanceId: string}>})
    {
        await dbConnect();
        
        const {attendanceStatus}=await req.json();
        const { attendanceId } = await params;
        
        try {
            // Find the attendance record by ID and update its status
            const updatedAttendance = await Attendance.findByIdAndUpdate(
                attendanceId,
                { attendanceStatus },
                { new: true } // Return the updated document
            );
            return NextResponse.json({ success: true, updatedAttendance });
        } catch (error) {
            console.error("Error updating attendance:", error);
            return NextResponse.json({ success: false, error: "Failed to update attendance" }, { status: 500 });
        }
    }
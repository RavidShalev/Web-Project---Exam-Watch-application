import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Attendance from "@/app/models/Attendance";

/**
 * PATCH /api/attendance/[attendanceId]
 * Updates a student's attendance status (present, absent, finished) and related timestamps.
 */
export async function PATCH(
    req: Request,
    {params}: {params: Promise<{attendanceId: string}>})
    {
        await dbConnect();
        
        const {attendanceStatus}=await req.json();
        const { attendanceId } = await params;
        
        try {
            const updateData: any = { attendanceStatus,};

            // if changing to present – set start time
            if (attendanceStatus === "present") {
            updateData.startTime = new Date();
            updateData.isOnToilet = false;
            }

            // if changing to absent – clear times
            if (attendanceStatus === "absent") {
            updateData.startTime = null;
            updateData.endTime = null;
            updateData.isOnToilet = false;
            }

            // if changing to finished – set end time
            if(attendanceStatus==="finished")
            {
                updateData.endTime=new Date();
                updateData.isOnToilet = false;
            }
            // update the attendance record
            const updatedAttendance = await Attendance.findByIdAndUpdate(
            attendanceId,
            updateData,
            { new: true }
            );

            return NextResponse.json({ success: true, updatedAttendance });
        } catch (error) {
            console.error("Error updating attendance:", error);
            return NextResponse.json({ success: false, error: "Failed to update attendance" }, { status: 500 });
        }
    }
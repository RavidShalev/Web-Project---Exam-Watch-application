import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Attendance from "@/app/models/Attendance";

/**
 * PATCH /api/attendance/[attendanceId]
 * Adds extra time (in minutes) to a student's attendance record.
 */
export async function PATCH(
    req: Request,
    {params}: {params: Promise<{attendanceId: string}>})
    {
        await dbConnect();

        const {minutesToAdd}=await req.json();
        const { attendanceId } = await params;

        try{
            const attendance = await Attendance.findById(attendanceId);
            // if not found any record with attendanceId
            if (!attendance) {
                  return NextResponse.json(
                    { success: false, error: "Attendance not found" },
                    { status: 404 }
                  );
            }

            // add the minutes to the extraTimeMinutes we already added
            attendance.extraTimeMinutes =attendance.extraTimeMinutes + minutesToAdd;

            await attendance.save();

            return NextResponse.json({success: true,attendance,});
        }catch (error) {
            console.error("Error updating time to add for the student:", error);
            return NextResponse.json(
            { success: false, error: "Failed to update time to add" },
             { status: 500 });
        }
    }
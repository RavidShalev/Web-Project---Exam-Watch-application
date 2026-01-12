import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Attendance from "@/app/models/Attendance";

export async function PATCH(
    req: Request,
    {params}: {params: Promise<{attendanceId: string}>})
    {
        await dbConnect();

        const {timeToAdd}=await req.json();
        const { attendanceId } = await params;

        try{
            const attendance = await Attendance.findById(attendanceId);
            if (!attendance) {
                  return NextResponse.json(
                    { success: false, error: "Attendance not found" },
                    { status: 404 }
                  );
            }



        }catch (error) {
            console.error("Error updating time to add for the student:", error);
            return NextResponse.json(
            { success: false, error: "Failed to update time to add" },
             { status: 500 });
        }
    }
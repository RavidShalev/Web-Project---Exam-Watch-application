import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Attendance from "@/app/models/Attendance";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ attendanceId: string }> }
) {
  await dbConnect();

  const { attendanceId } = await params;

  try {
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return NextResponse.json(
        { success: false, error: "Attendance not found" },
        { status: 404 }
      );
    }

    attendance.isOnToilet = !attendance.isOnToilet;
    await attendance.save();

    return NextResponse.json({
      success: true,
      updatedAttendance: attendance,
    });
  } catch (error) {
    console.error("Error updating toilet status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update toilet status" },
      { status: 500 }
    );
  }
}
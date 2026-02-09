import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../lib/db";
import Procedure from "../../models/Procedure";

/**
 * GET /api/procedures
 * Returns exam procedures, optionally filtered by user role.
 */
export async function GET(request: NextRequest) {
  try {
    // connect to DB
    await dbConnect();

    // read query params
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const query: any = {};
    if (role) {
      query.targetRoles = { $in: [role] };
    }

    const procedures = await Procedure.find(query).sort({ sectionId: 1 }); // sort by sectionId

    return NextResponse.json({ success: true, data: procedures });

  } catch (error) {
    console.error("Error fetching procedures:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
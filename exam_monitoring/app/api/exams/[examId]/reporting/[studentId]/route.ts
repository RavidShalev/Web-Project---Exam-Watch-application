import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/db";
import Report from "../../../../../models/Report";
import {logAuditEvent} from "../../../../../lib/auditLogger";

export async function POST(
  req: Request,
  context: { params: Promise<{ examId: string; studentId: string }> }
) {
    try {
        // connect to the database, if already connected, does nothing
        await dbConnect();
        const { examId, studentId } = await context.params;
        const { eventType, description, supervisorId } = await req.json();

        if (!eventType ) {
            return NextResponse.json(
                { message: "Missing eventType in request body" },
                { status: 400 }
            );
        }

        const report = await Report.create({
            examId: examId,
            studentId: studentId,
            eventType: eventType,
            description: description || "",
            supervisorId: supervisorId,
            createdAt: new Date(),
        });
        await logAuditEvent({userId: supervisorId, action: "הוספת דיווח על סטודנט", examId: examId.toString(), status: true,});
        return NextResponse.json({ message: "Report created successfully", report });
    } catch (err) {
        return NextResponse.json(
            { message: err instanceof Error ? err.message : "Unknown server error" },
            { status: 500 }
        );
    }
}

import dbConnect from "../../../../../lib/db";
import User from "../../../../../models/Users";
import Exam from "../../../../../models/Exams";
import { NextResponse } from "next/server";

type UserDoc = {
  _id: string;
  idNumber: string;
};

// API route to handle CSV file upload and extract student ID numbers
export async function POST(
  req: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;
  try {
    // Reading the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "CSV file is missing" },
        { status: 400 }
      );
    }

    const text = await file.text();

    // split lines, remove empty ones
    const lines = text
      .replace(/^\uFEFF/, "") // Remove BOM if present
      .split(/\r?\n/) // split by new line
      .map((l) => l.trim()) // trim spaces
      .filter(Boolean) // remove empty lines
      .slice(1); // skip header line

    // extract only numbers (tz)
    const tzList: string[] = lines
      .map((line) => line.split(",").pop()?.trim())
      .filter((v): v is string => v !== undefined && /^\d+$/.test(v));

    await dbConnect();

    // find users by tz
    const users = await User.find({
      idNumber: { $in: tzList },
    }).select("_id idNumber");

    // map tz -> ObjectId
    const tzToId = new Map<string, string>(
      users.map((u: UserDoc) => [u.idNumber, u._id])
    );

    const validUserIds: string[] = [];
    const missingTz: string[] = [];

    // separate valid and missing tz
    for (const tz of tzList) {
      const id = tzToId.get(tz);

      if (id !== undefined) {
        validUserIds.push(id);
      } else {
        missingTz.push(tz);
      }
    }

    console.log("TZ LIST:", tzList);
    console.log("FOUND USERS:", users);
    console.log("VALID IDS:", validUserIds);

    // update exam
    await Exam.findByIdAndUpdate(examId, {
      $set: {
        students: validUserIds,
      },
    });

    return NextResponse.json({
      success: true,
      added: validUserIds.length,
      missing: missingTz,
    });
  } catch (err) {
    console.error("CSV parse error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to parse CSV" },
      { status: 500 }
    );
  }
}
